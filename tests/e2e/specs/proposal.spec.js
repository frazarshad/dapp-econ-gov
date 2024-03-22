/* eslint-disable ui-testing/no-disabled-tests */
describe('Make Proposal Tests', () => {
  let startTime;
  context('PSM tests', () => {
    it('should setup two econ committee member wallets', () => {
      cy.setupWallet({
        secretWords:
          'purse park grow equip size away dismiss used evolve live blouse scorpion enjoy crunch combine day second news off crowd broken crop zoo subject',
        walletName: 'gov1',
      });
      cy.setupWallet({
        secretWords:
          'tilt add stairs mandate extra wash choose fashion earth feature reopen until move lazy carbon pledge sure own comfort this nasty clap tower table',
        walletName: 'gov2',
      });
    });

    it('should connect to wallet', () => {
      cy.visit('/?agoricNet=local');
      cy.acceptAccess();
    });

    it('should allow gov1 to create a proposal', () => {
      cy.visit('/?agoricNet=local');

      // open PSM and select USDT_axl
      cy.get('button').contains('PSM').click();
      cy.get('button').contains('AUSD').click();
      cy.get('button').contains('USDT_axl').click();

      // Change mint limit to 100 and proposal time to 1 min
      cy.get('label')
        .contains('Set Mint Limit')
        .parent()
        .within(() => {
          cy.get('input').clear().type(100);
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(1);
        });
      cy.get('[value="Propose Parameter Change"]').click();

      // Submit proposal and wait for confirmation
      cy.confirmTransaction();
      cy.get('p')
        .contains('sent')
        .should('be.visible')
        .then(() => {
          startTime = Date.now();
        });
    });

    it('should allow gov2 to vote on the proposal', () => {
      cy.visit('/?agoricNet=local');

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
      cy.get('input:enabled[value="Submit Vote"]').click();

      // Wait for vote to confirm
      cy.confirmTransaction();
      cy.get('p').contains('sent').should('be.visible');
    });

    it('should allow gov1 to vote on the proposal', () => {
      cy.switchWallet('gov1');
      cy.visit('/?agoricNet=local');

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
      cy.get('input:enabled[value="Submit Vote"]').click();

      // Wait for vote to confirm
      cy.confirmTransaction();
      cy.get('p').contains('sent').should('be.visible');
    });

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(60000 - Date.now() + startTime);
      cy.visit('/?agoricNet=local');

      cy.get('button').contains('History').click();

      // Select the first element proposal containing USDT_axl and check
      // its status should be accepted
      cy.get('code')
        .contains('psm-IST-USDT_axl')
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('span').contains('Change Accepted').should('be.visible');
        });
    });
  });

  context('Vaults tests', () => {
    it('should allow gov1 to create a proposal', () => {
      cy.visit('/?agoricNet=local');

      // open Values and select manager 0
      cy.get('button').contains('Vaults').click();
      cy.get('button').contains('Select Manager').click();
      cy.get('button').contains('manager0').click();

      // Change debt limit to 1.22M and proposal time to 1 min
      cy.get('label')
        .contains('DebtLimit')
        .parent()
        .within(() => {
          cy.get('input').clear().type('122,000,000');
        });
      cy.get('label')
        .contains('Minutes until close of vote')
        .parent()
        .within(() => {
          cy.get('input').clear().type(1);
        });
      cy.get('[value="Propose Parameter Change"]').click();

      // Submit proposal and wait for confirmation
      cy.confirmTransaction();
      cy.get('p')
        .contains('sent')
        .should('be.visible')
        .then(() => {
          startTime = Date.now();
        });
    });

    it('should allow gov1 to vote on the proposal', () => {
      cy.visit('/?agoricNet=local');

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
      cy.get('input:enabled[value="Submit Vote"]').click();

      // Wait for vote to confirm
      cy.confirmTransaction();
      cy.get('p').contains('sent').should('be.visible');
    });

    it('should allow gov2 to vote on the proposal', () => {
      cy.switchWallet('gov2');
      cy.visit('/?agoricNet=local');

      // Open vote, click on yes and submit
      cy.get('button').contains('Vote').click();
      cy.get('p').contains('YES').click();
      cy.get('input:enabled[value="Submit Vote"]').click();

      // Wait for vote to confirm
      cy.confirmTransaction();
      cy.get('p').contains('sent').should('be.visible');
    });

    it('should wait for proposal to pass', () => {
      // Wait for 1 minute to pass
      cy.wait(60000 - Date.now() + startTime);
      cy.visit('/?agoricNet=local');

      cy.get('button').contains('History').click();

      // Select the first element proposal containing ATOM and check
      // its status should be accepted
      cy.get('code')
        .contains('VaultFactory - ATOM')
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('span').contains('Change Accepted').should('be.visible');
        });
    });
  });
});
