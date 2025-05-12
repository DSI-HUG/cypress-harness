<h1 align="center">
    @DSI-HUG/cypress-harness
</h1>

<p align="center">
    <i>🔬 <a href="https://www.cypress.io" alt="cypress">Cypress</a> support for Angular component test harnesses.</i><br/>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@DSI-HUG/cypress-harness">
        <img src="https://img.shields.io/npm/v/@DSI-HUG/cypress-harness.svg?color=blue&logo=npm" alt="npm version" /></a>
    <a href="https://npmcharts.com/compare/@DSI-HUG/cypress-harness?minimal=true">
        <img src="https://img.shields.io/npm/dw/@DSI-HUG/cypress-harness.svg?color=7986CB&logo=npm" alt="npm donwloads" /></a>
    <a href="https://github.com/DSI-HUG/cypress-harness/blob/main/LICENSE">
        <img src="https://img.shields.io/npm/l/@DSI-HUG/cypress-harness.svg?color=ff69b4" alt="license" /></a>
</p>

<p align="center">
    <a href="https://github.com/DSI-HUG/cypress-harness/actions/workflows/ci_tests.yml">
        <img src="https://github.com/DSI-HUG/cypress-harness/actions/workflows/ci_tests.yml/badge.svg" alt="build status" /></a>
    <a href="https://github.com/DSI-HUG/cypress-harness/blob/main/CONTRIBUTING.md#-submitting-a-pull-request-pr">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>

<hr/>

#### Component test harnesses

> A component harness is a class that lets a test interact with a component via a supported API. Each harness's API interacts with a component the same way a user would. By using the harness API, a test insulates itself against updates to the internals of a component, such as changing its DOM structure. The idea for component harnesses comes from the [PageObject](https://martinfowler.com/bliki/PageObject.html) pattern commonly used for integration testing.

[More info](https://material.angular.io/cdk/test-harnesses/overview)

<hr/>

## Installation

```sh
npm install @DSI-HUG/cypress-harness --save-dev
```

```sh
yarn add @DSI-HUG/cypress-harness --dev
```


## Usage

__Methods__

- `getHarness(query)` - searches for an harness instance from a given HarnessPredicate
- `getAllHarnesses(query)` - acts like getHarness, but returns an array of harness instances
- `getInputHarness(filter)` - searches for an harness instance from a MatInput qith the specified filter
- `getInputHarness(selector)` - searches for an harness instance from a MatInput qith the specified selector
- `getAutocompleteHarness(filter)` - searches for an harness instance from a MatAutocomplete qith the specified filter
- `getAutocompleteHarness(selector)` - searches for an harness instance from a MatAutocomplete qith the specified selector
- `getListOptionHarness(filter)` - searches for an harness instance from a MatListOption qith the specified filter
- `getListOptionHarness(selector)` - searches for an harness instance from a MatListOption qith the specified selector
- `getButtonHarness(filter)` - searches for an harness instance from a MatButton qith the specified filter
- `getButtonHarness(selector)` - searches for an harness instance from a MatButton qith the specified selector
- `getButtonToggleGroupHarness(filter)` - searches for an harness instance from a MatButtonToggle qith the specified filter
- `getButtonToggleGroupHarness(selector)` - searches for an harness instance from a MatButtonToggle qith the specified selector
- `getNavListHarness(filter)` - searches for an harness instance from a MatNavList qith the specified filter
- `getNavListHarness(selector)` - searches for an harness instance from a MatNavList qith the specified selector
- `getNavListItemHarness(filter)` - searches for an harness instance from a MatNavListItem qith the specified filter
- `getNavListItemHarness(selector)` - searches for an harness instance from a MatNavListItem qith the specified selector
- `getListItemHarness(filter)` - searches for an harness instance from a MatListItem qith the specified filter
- `getListItemHarness(selector)` - searches for an harness instance from a MatListItem qith the specified selector
- `getCheckBoxHarness(filter)` - searches for an harness instance from a MatCheckBox qith the specified filter
- `getCheckBoxHarness(selector)` - searches for an harness instance from a MatCheckBox qith the specified selector
- `getRadioButtonHarness(filter)` - searches for an harness instance from a MatRadioButton qith the specified filter
- `getRadioButtonHarness(selector)` - searches for an harness instance from a MatRadioButton qith the specified selector
- `getRadioGroupHarness(filter)` - searches for an harness instance from a MatRadioGroup qith the specified filter
- `getRadioGroupHarness(selector)` - searches for an harness instance from a MatRadioGroup qith the specified selector
- `getMenuHarness(filter)` - searches for an harness instance from a MatMenu qith the specified filter
- `getMenuHarness(selector)` - searches for an harness instance from a MatMenu qith the specified selector
- `getMenuItemHarness(filter)` - searches for an harness instance from a MatMenuItem qith the specified filter
- `getMenuItemHarness(selector)` - searches for an harness instance from a MatMenuItem qith the specified selector
- `getDatePickerInputHarness(filter)` - searches for an harness instance from a MatDatePickerInput qith the specified filter
- `getDatePickerInputHarness(selector)` - searches for an harness instance from a MatDatePickerInput qith the specified selector
- `getSlideToggleHarness(filter)` - searches for an harness instance from a MatSlideToggle qith the specified filter
- `getSlideToggleHarness(selector)` - searches for an harness instance from a MatSlideToggle qith the specified selector
- `getSelectHarness(filter)` - searches for an harness instance from a MatSelect qith the specified filter
- `getSelectHarness(selector)` - searches for an harness instance from a MatSelect qith the specified selector
- `getOptionHarness(filter)` - searches for an harness instance from a MatOption qith the specified filter
- `getOptionHarness(selector)` - searches for an harness instance from a MatOption qith the specified selector

__Example__

```ts
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { getHarness } from '@DSI-HUG/cypress-harness';

describe('Angular Material Harness', () => {
    beforeEach(async () => {
        await browser.url('http://localhost:4200');
    });

    it('MatDatePicker - setValue()', async () => {
        cy.get('#demo-datepicker-input').should('be.visible');

        getDatePickerInputHarness('#demo-datepicker-input').invoke('setValue', '9/27/1954');

        getDatePickerInputHarness('#demo-datepicker-input').then(async datepicker => {
            expect(await datepicker.getValue()).to.equal('9/27/1954');
        });
    });
});
```

More examples [here][examples].


## Development

See the [developer docs][developer].


## Contributing

#### > Want to Help ?

Want to file a bug, contribute some code or improve documentation ? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

#### > Code of Conduct

Please read and follow the [Code of Conduct][codeofconduct] and help me keep this project open and inclusive.




[developer]: https://github.com/DSI-HUG/cypress-harness/blob/main/DEVELOPER.md
[contributing]: https://github.com/DSI-HUG/cypress-harness/blob/main/CONTRIBUTING.md
[codeofconduct]: https://github.com/DSI-HUG/cypress-harness/blob/main/CODE_OF_CONDUCT.md
[examples]: https://github.com/DSI-HUG/cypress-harness/blob/main/projects/tests-e2e/harness.e2e.cy.ts
