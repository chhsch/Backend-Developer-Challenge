// cypress/integration/user_flow.spec.js

describe('User Registration and Post Creation', () => {
    it('Should register a new user', () => {
      cy.visit('http://localhost:3001/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('form').submit();
    });
    
    it('Should login the user', () => {
      cy.visit('http://localhost:3001/login');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('form').submit();
      cy.url().should('include', '/posts'); 
    });
  
    it('Should create a new post', () => {
      
      cy.get('textarea[name="description"]').type('This is a test post');
      const fileName = 'test-image.jpg';
      cy.fixture(fileName).then(fileContent => {
        cy.get('input[type="file"]').upload({ fileContent, fileName, mimeType: 'image/jpeg' });
      });
      cy.get('form').submit();
      cy.contains('Your post has been created'); 
    });
  });
  