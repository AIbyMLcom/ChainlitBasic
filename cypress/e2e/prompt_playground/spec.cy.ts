function openPlayground(index) {
  cy.get(".playground-button").eq(index).should("exist").click();
}

function closePlayground() {
  cy.get("#close-playground").should("exist").click();
}

const expectedTemplate =
  "Hello, this is a template.This is a variable1 {variable1}And this is variable2 {variable2}And this is variable1 + variable2 {variable1} + {variable2}";

const expectedFormattedTemplate =
  "Hello, this is a template.This is a variable1 variable1 valueAnd this is variable2 variable2 valueAnd this is variable1 + variable2 variable1 value + variable2 value";
const variable1ExpectedContent = "variable1 value";

const expectedFormatted = `This is a test formatted prompt`;

const expectedCompletion = "This is the test completion";

function testTemplate(chat?: boolean) {
  it("should display the template and highlight the variables", () => {
    cy.get(".tab-Template").should("exist").click();

    cy.get(".template-editor [contenteditable]")
      .should("exist")
      .should("contain", expectedTemplate);

    const expectedCount = chat ? 4 : 2;

    cy.get(".input-variable1").should("have.length", expectedCount);

    cy.get(".input-variable2").should("have.length", expectedCount);
  });

  it("should let the user click a variable to edit its value", () => {
    cy.get(".input-variable1").eq(0).click();

    cy.get("#variable-modal [contenteditable]")
      .should("exist")
      .should("contain", variable1ExpectedContent);

    cy.get("#edit-variable").should("exist").click();
  });

  it("should display the formatted template", () => {
    cy.get(".tab-Formatted").should("exist").click();
    cy.get(".formatted-editor [contenteditable]")
      .should("exist")
      .should("contain", expectedFormattedTemplate);
  });

  it("should prevent the user to update the formatted template", () => {
    cy.get(".formatted-editor [contenteditable]")
      .eq(0)
      .type("test")
      .should("contain", expectedFormattedTemplate);
  });
}

function testFormatted() {
  it("should display the missing template warning", () => {
    cy.get("#template-warning").should("exist");
  });

  it("should display the formatted prompt", () => {
    cy.get(".formatted-editor [contenteditable]")
      .should("exist")
      .should("contain", expectedFormatted);
  });

  it("should let the user update the formatted prompt", () => {
    cy.get(".formatted-editor [contenteditable]")
      .eq(0)
      .type("test")
      .should("contain", "test" + expectedFormatted);
  });
}

function testCompletion() {
  it("should be able to call the LLM provider and stream the completion", () => {
    cy.get("#submit-prompt").should("exist").click();
    cy.get(".completion-editor [contenteditable]").should(
      "contain",
      expectedCompletion
    );
  });
}

describe("PromptPlayground", () => {
  before(() => {
    cy.visit("http://127.0.0.1:8000");
  });
  describe("Basic template", () => {
    before(() => {
      openPlayground(0);
    });
    after(() => {
      closePlayground();
    });
    testTemplate(false);
    testCompletion();
  });

  describe("Basic formatted", () => {
    before(() => {
      openPlayground(1);
    });
    after(() => {
      closePlayground();
    });

    testFormatted();
    testCompletion();
  });

  describe("Chat template", () => {
    before(() => {
      openPlayground(2);
    });
    after(() => {
      closePlayground();
    });
    testTemplate(true);
    testCompletion();
  });

  describe("Chat formatted", () => {
    before(() => {
      openPlayground(3);
    });
    after(() => {
      closePlayground();
    });

    testFormatted();
    testCompletion();
  });
});