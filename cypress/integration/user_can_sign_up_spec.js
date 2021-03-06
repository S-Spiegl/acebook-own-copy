describe("Registration", () => {
  it("A user signs up and is redirected to sign in", () => {
    // sign up
    cy.visit("/users/new");
    cy.get("#name").type("Test name 1");
    cy.get("#email").type("someone@example.com");
    cy.get("#password").type("password");
    cy.get("#signup-button").click();

    cy.url().should("include", "/sessions/new");
  });
});
