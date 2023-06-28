const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

class Base {
    constructor(driver) {
        this.driver = driver;
    }

    async focusElement(locator) {
        const element = await this.driver.findElement(locator);
        await this.driver.executeScript('arguments[0].focus();', element);
    }

    async clickElement(locator) {
        await this.driver.findElement(locator).click();
    }

    async enterText(locator, text) {
        await this.focusElement(locator);
        await this.driver.findElement(locator).sendKeys(text);
    }

    async clickSubmitButton() {
        await this.clickElement(this.submitButton);
    }
}

class Registration extends Base {
    constructor(driver) {
        super(driver);
        this.firstNameInput = By.css('input[formcontrolname="firstName"]');
        this.lastNameInput = By.css('input[formcontrolname="lastName"]');
        this.emailInput = By.css('input[formcontrolname="email"]');
        this.passwordInput = By.css('input[formcontrolname="password"]');
        this.confirmPasswordInput = By.css('input[formcontrolname="confirmPass"]');
        this.submitButton = By.css('button.signup-button');
    }

    async enterRegistrationDetails(firstName, lastName, email, password, confirmPassword) {
        await this.enterText(this.firstNameInput, firstName);
        await this.enterText(this.lastNameInput, lastName);
        await this.enterText(this.emailInput, email);
        await this.enterText(this.passwordInput, password);
        await this.enterText(this.confirmPasswordInput, confirmPassword);
    }
}

class Santander extends Base {
    constructor(driver) {
        super(driver);
        this.nameInput = By.css('input.ng-tns-c170-8.ng-untouched');
        this.industryInput = By.css('input.mat-autocomplete-trigger');
        this.industryOption = By.css('#mat-option-1');
        this.phoneNumberInput = By.css('input[pephoneinputfilter]');
        this.vatIdInput = By.css('input.ng-tns-c170-14.ng-untouched');
        this.submitButton = By.css('button.signup-button');
    }

    async enterPageSantanderDetails(name, phoneNumber, vatId) {
        await this.enterText(this.nameInput, name);
        await this.enterText(this.phoneNumberInput, phoneNumber);
        await this.enterText(this.vatIdInput, vatId);
    }

    async selectIndustry() {
        await this.focusElement(this.industryInput);
        await this.clickElement(this.industryInput);
        await this.focusElement(this.industryOption);
        await this.clickElement(this.industryOption);
    }
}

class Fashion extends Base {
    constructor(driver) {
        super(driver);
        this.nameInput = By.css('input[formcontrolname="name"]');
        this.phoneNumberInput = By.css('input[formcontrolname="phoneNumber"]');
        this.submitButton = By.css('button.signup-button');
    }

    async enterPageFashionDetails(name, phoneNumber) {
        await this.enterText(this.nameInput, name)
        .then(() => this.enterText(this.phoneNumberInput, phoneNumber));
    }
}

class DashboardPage extends Base {
    constructor(driver) {
        super(driver);
        this.appStoreButton = By.css('button.welcome-screen-content-button');
        this.appElements = By.css('div.icons__title');
    }

    async clickGetStarted() {
        await this.clickElement(this.appStoreButton);
    }

    async isAppPresent(appLocator) {
        const elements = await this.driver.findElements(appLocator);
        return elements.length > 0;
    }
}

describe('Test Suite', () => {
    let driver;
    let registration;
    let santander;
    let fashion;
    let dashboard;
    const baseUrl = 'https://commerceos.staging.devpayever.com/registration/';

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        registration = new Registration(driver);
        santander = new Santander(driver);
        fashion = new Fashion(driver);
        dashboard = new DashboardPage(driver);
    });

    it('Test Case 1 - fashion', async () => {
        await driver.get(baseUrl + 'fashion');

        await driver.wait(until.elementLocated(registration.firstNameInput));
        await registration.enterRegistrationDetails('Saurav', 'Kumar', 'saurav222@gmail.com', 'Jxcvbnmlk@1', 'Jxcvbnmlk@1');
        await registration.clickSubmitButton();

        await driver.wait(until.elementLocated(fashion.nameInput));
        await fashion.enterPageFashionDetails('TestQA', '1234567890');
        await fashion.clickSubmitButton();

        await driver.wait(until.elementLocated(dashboard.appStoreButton));
        await dashboard.clickGetStarted();

        await driver.wait(until.elementLocated(dashboard.appElements));
        const expectedApps = ['Transactions', 'Checkout', 'Connect', 'Products', 'Shop', 'Message', 'Settings'];
        for (let i = 0; i < expectedApps.length; i++) {
            const appLocator = By.xpath(`//div[contains(text(), '${expectedApps[i]}')]`);
            const isAppPresent = await dashboard.isAppPresent(appLocator);
            expect(isAppPresent).to.be.true;
        }
    });

    it('Test Case 2 - santander', async () => {
        await driver.get(baseUrl + 'santander');

        await driver.wait(until.elementLocated(registration.firstNameInput));
        await registration.enterRegistrationDetails('Saurav', 'Kumar', 'saurav223@gmail.com', 'Jxcvbnmlk@1', 'Jxcvbnmlk@1');
        await registration.clickSubmitButton();
        await driver.wait(until.elementLocated(santander.nameInput));
        await santander.enterPageSantanderDetails('TestQA', '1234567890', 'GB999999975');
        await santander.selectIndustry();
        await santander.clickSubmitButton();

        await driver.wait(until.elementLocated(dashboard.appStoreButton));
        await dashboard.clickGetStarted();

        await driver.wait(until.elementLocated(dashboard.appStoreButton));
        await dashboard.clickGetStarted();

        await driver.wait(until.elementLocated(dashboard.appElements));
        const expectedApps = ['Transactions', 'Checkout', 'Connect', 'Point of Sale', 'Settings'];
        for (let i = 0; i < expectedApps.length; i++) {
            const appLocator = By.xpath(`//div[contains(text(), '${expectedApps[i]}')]`);
            const isAppPresent = await dashboard.isAppPresent(appLocator);
            expect(isAppPresent).to.be.true;
        }
    });

    after(async () => {
        await driver.quit();
    });
});