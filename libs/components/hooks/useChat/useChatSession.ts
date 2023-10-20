import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useCallback } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState
} from 'recoil';
import io from 'socket.io-client';
import { TFormInput } from 'src/inputs';
import { IAction, IElement, IMessage } from 'src/types';
import {
  addNestedMessage,
  deleteMessageById,
  updateMessageById,
  updateMessageContentById
} from 'utils/message';

import {
  actionState,
  askUserState,
  avatarState,
  chatSettingsInputsState,
  chatSettingsValueState,
  elementState,
  firstUserMessageState,
  loadingState,
  messagesState,
  nestedMessagesState,
  sessionIdState,
  sessionState,
  tasklistState,
  tokenCountState
} from './state';
import { IMessageUpdate, IToken } from './useChatData';

const useChatSession = () => {
  const sessionId = useRecoilValue(sessionIdState);

  const [session, setSession] = useRecoilState(sessionState);

  const resetChatSettingsValue = useResetRecoilState(chatSettingsValueState);
  const setFirstUserMessage = useSetRecoilState(firstUserMessageState);
  const setLoading = useSetRecoilState(loadingState);
  const setMessages = useSetRecoilState(messagesState);
  const setNestedMessages = useSetRecoilState(nestedMessagesState);
  const setAskUser = useSetRecoilState(askUserState);
  const setElements = useSetRecoilState(elementState);
  const setAvatars = useSetRecoilState(avatarState);
  const setTasklists = useSetRecoilState(tasklistState);
  const setActions = useSetRecoilState(actionState);
  const setChatSettingsInputs = useSetRecoilState(chatSettingsInputsState);
  const setTokenCount = useSetRecoilState(tokenCountState);

  const _connect = useCallback(
    ({
      wsEndpoint,
      userEnv,
      accessToken,
      chatProfile
    }: {
      wsEndpoint: string;
      userEnv: Record<string, string>;
      accessToken?: string;
      chatProfile?: string;
    }) => {
      const socket = io(wsEndpoint, {
        path: '/ws/socket.io',
        extraHeaders: {
          Authorization: accessToken || '',
          'X-Chainlit-Session-Id': sessionId,
          'user-env': JSON.stringify(userEnv),
          'X-Chainlit-Chat-Profile': chatProfile || ''
        }
      });
      setSession((old) => {
        old?.socket?.removeAllListeners();
        old?.socket?.close();
        return {
          socket
        };
      });

      socket.on('connect', () => {
        socket.emit('connection_successful');
        setSession((s) => ({ ...s!, error: false }));
      });

      socket.on('connect_error', (_) => {
        setSession((s) => ({ ...s!, error: true }));
      });

      socket.on('task_start', () => {
        setLoading(true);
      });

      socket.on('task_end', () => {
        setLoading(false);
      });

      socket.on('reload', () => {
        socket.emit('clear_session');
        window.location.reload();
      });

      socket.on('new_message', (message: IMessage) => {
        setMessages((oldMessages) => {
          const index = oldMessages.findIndex((m) => isEqual(m.id, message.id));
          if (index === -1) {
            return [...oldMessages, message];
          } else {
            return [
              ...oldMessages.slice(0, index),
              message,
              ...oldMessages.slice(index + 1)
            ];
          }
        });

        setNestedMessages((oldNestedMessages) =>
          addNestedMessage(oldNestedMessages, message)
        );
      });

      socket.on('init_conversation', (message: IMessage) => {
        setFirstUserMessage(message);
      });

      socket.on('update_message', (message: IMessageUpdate) => {
        setNestedMessages((oldNestedMessages) =>
          updateMessageById(oldNestedMessages, message.id, message)
        );
      });

      socket.on('delete_message', (message: IMessage) => {
        setMessages((oldMessages) => {
          const index = oldMessages.findIndex((m) => isEqual(m.id, message.id));

          if (index === -1) return oldMessages;
          return [
            ...oldMessages.slice(0, index),
            ...oldMessages.slice(index + 1)
          ];
        });

        setNestedMessages((oldNestedMessages) =>
          deleteMessageById(oldNestedMessages, message.id)
        );
      });

      socket.on('stream_start', (message: IMessage) => {
        setMessages((oldMessages) => {
          const index = oldMessages.findIndex((m) => m.id === message.id);
          if (index === -1) {
            return [...oldMessages, message];
          }
          return oldMessages;
        });

        setNestedMessages((oldNestedMessages) =>
          addNestedMessage(oldNestedMessages, message)
        );
      });

      socket.on('stream_token', ({ id, token, isSequence }: IToken) => {
        setMessages((oldMessages) => {
          const index = oldMessages.findIndex((m) => m.id === id);
          if (index === -1) return oldMessages;
          const oldMessage = oldMessages[index];
          const newMessage = { ...oldMessage };
          if (isSequence) {
            newMessage.content = token;
          } else {
            newMessage.content += token;
          }
          return [
            ...oldMessages.slice(0, index),
            newMessage,
            ...oldMessages.slice(index + 1)
          ];
        });

        setNestedMessages((oldNestedMessages) =>
          updateMessageContentById(oldNestedMessages, id, token, isSequence)
        );
      });

      socket.on('ask', ({ msg, spec }, callback) => {
        setAskUser({ spec, callback });
        setMessages((oldMessages) => [...oldMessages, { ...msg }]);
        setNestedMessages((oldNestedMessages) =>
          addNestedMessage(oldNestedMessages, msg)
        );

        setLoading(false);
      });

      socket.on('ask_timeout', () => {
        setAskUser(undefined);
        setLoading(false);
      });

      socket.on('clear_ask', () => {
        setAskUser(undefined);
      });

      socket.on('chat_settings', (inputs: TFormInput[]) => {
        setChatSettingsInputs(inputs);
        resetChatSettingsValue();
      });

      socket.on('element', (element: IElement) => {
        if (element.type === 'avatar') {
          setAvatars((old) => [...old, element]);
        } else if (element.type === 'tasklist') {
          setTasklists((old) => [...old, element]);
        } else {
          setElements((old) => [...old, element]);
        }
      });

      socket.on(
        'update_element',
        (update: { id: string; forIds: string[] }) => {
          setElements((old) => {
            const index = old.findIndex((e) => e.id === update.id);
            if (index === -1) return old;
            const element = old[index];
            const newElement = { ...element, forIds: update.forIds };
            return [
              ...old.slice(0, index),
              newElement,
              ...old.slice(index + 1)
            ];
          });
        }
      );

      socket.on('remove_element', (remove: { id: string }) => {
        setElements((old) => {
          return old.filter((e) => e.id !== remove.id);
        });
        setTasklists((old) => {
          return old.filter((e) => e.id !== remove.id);
        });
        setAvatars((old) => {
          return old.filter((e) => e.id !== remove.id);
        });
      });

      socket.on('action', (action: IAction) => {
        setActions((old) => [...old, action]);
      });

      socket.on('remove_action', (action: IAction) => {
        setActions((old) => {
          const index = old.findIndex((a) => a.id === action.id);
          if (index === -1) return old;
          return [...old.slice(0, index), ...old.slice(index + 1)];
        });
      });

      socket.on('token_usage', (count: number) => {
        setTokenCount((old) => old + count);
      });
    },
    [setSession, sessionId]
  );

  const connect = useCallback(debounce(_connect, 1000), [_connect]);

  const disconnect = useCallback(() => {
    if (session?.socket) {
      session.socket.removeAllListeners();
      session.socket.close();
    }
  }, [session]);

  return { connect, disconnect };
};

export { useChatSession };