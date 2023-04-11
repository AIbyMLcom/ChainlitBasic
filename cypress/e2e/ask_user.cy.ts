import { submitMessage } from "./utils";

describe("Ask User", () => {
  before(() => {
    cy.intercept("/project/settings").as("settings");
    cy.visit("http://127.0.0.1:8000");
    cy.wait(["@settings"]);
  });

  it("should work locally", () => {
    cy.get("#welcome-screen").should("exist");
    cy.get(".message").should("have.length", 1);
    cy.get("#wait-for-response").should("exist");
    submitMessage("Jeeves");
    cy.wait(2000);
    cy.get(".message").should("have.length", 3);

    cy.get(".message").eq(2).should("contain", "Jeeves");
  });
});
