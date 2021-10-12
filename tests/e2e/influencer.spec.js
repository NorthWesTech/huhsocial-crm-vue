const apiURL = Cypress.env("apiURL");

context("Influencer", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  describe("Create Influencer", () => {
    it("create influencer successfully", () => {
      cy.visit("/influencers/new");

      cy.get("[data-cy=first-name]")
        .type("Test")
        .should("have.value", "Test");

      cy.get("[data-cy=last-name]")
        .type("Influencer")
        .should("have.value", "Influencer");

      cy.get("[data-cy=contract-value]")
        .type("18750")
        .should("have.value", "18750");

      cy.server();
      cy.route("POST", `${apiURL}/influencer/create`).as("influencerCreate");

      cy.get("#influencerForm").submit();
      cy.wait("@influencerCreate");

      cy.url().should("include", "/influencers/profile");

      cy.get("h1").should("contain", "Test Influencer");
    });
  });

  describe("Edit Influencer", () => {
    it("edit influencer successfully", () => {
      cy.server();
      cy.route("POST", `${apiURL}/influencer/list`).as("influencerList");
      cy.route("GET", `${apiURL}/influencer/info/**`).as("influencerInfo");
      cy.route("POST", `${apiURL}/influencer/edit`).as("influencerEdit");

      cy.get("[data-cy=search-clue]")
        .type("Test Influencer")
        .should("have.value", "Test Influencer");

      cy.wait(1000);

      cy.wait("@influencerList");

      cy.get("[data-cy=table-full-name]")
        .contains("Test Influencer")
        .click();

      cy.wait(1000);

      cy.url().should("include", "/influencers/profile");

      cy.wait("@influencerInfo");

      cy.get("h1").should("contain", "Test Influencer");

      cy.get("[data-cy=influencer-edit]").click();

      cy.wait("@influencerInfo");

      cy.get("h1").should("contain", "Edit Influencer info");

      cy.get("#influencerForm").submit();

      cy.wait("@influencerEdit");

      cy.url().should("include", "/influencers/profile");

      cy.get("h1").should("contain", "Test Influencer");
    });
  });

  describe("Delete Influencer", () => {
    it("delete influencer on profile page", () => {
      cy.server();
      cy.route("POST", `${apiURL}/influencer/list`).as("influencerList");
      cy.route("GET", `${apiURL}/influencer/info/**`).as("influencerInfo");
      cy.route("DELETE", `${apiURL}/influencer/**`).as("influencerDelete");

      cy.get("[data-cy=search-clue]")
        .type("Test Influencer")
        .should("have.value", "Test Influencer");

      cy.wait(1000);

      cy.wait("@influencerList").should("have.property", "status", 201);

      cy.get("[data-cy=table-full-name]")
        .contains("Test Influencer")
        .click();

      cy.wait(1000);

      cy.url().should("include", "/influencers/profile");

      cy.wait("@influencerInfo").should("have.property", "status", 200);

      cy.get("h1").should("contain", "Test Influencer");

      cy.get("[data-cy=influencer-delete]").click();

      cy.get("[data-cy='confirm-delete']").click();

      cy.wait("@influencerList").should("have.property", "status", 201);

      //influencer-delete
    });
  });
});
