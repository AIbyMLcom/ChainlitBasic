import { submitMessage } from "../../support/testUtils";

describe("LangChain async postprocess", () => {
  before(() => {
    cy.intercept("/project/settings").as("settings");
    cy.visit("http://127.0.0.1:8000");
    cy.wait(["@settings"]);
  });

  it("should be able to postprocess an LangChain output", () => {
    cy.get("#welcome-screen").should("exist");
    submitMessage("Hello");
    cy.get("#llmchain-done").should("exist");
    const messages = cy.get(".message");
    messages.should("have.length", 2);
    messages
      .eq(1)
      .should(
        "contain",
        "Postprocessed output: In the end it doesn't even matter."
      );
  });
});
