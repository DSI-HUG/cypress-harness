
import { HarnessEnvironment, TestElement, type ComponentHarness, type HarnessQuery } from '@angular/cdk/testing';
import { type AutocompleteHarnessFilters, MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { type ButtonHarnessFilters, MatButtonHarness } from '@angular/material/button/testing';
import { type ButtonToggleGroupHarnessFilters, MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { type CheckboxHarnessFilters, MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatOptionHarness, type OptionHarnessFilters } from '@angular/material/core/testing';
import { type DatepickerInputHarnessFilters, MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { type InputHarnessFilters, MatInputHarness } from '@angular/material/input/testing';
import { type ListItemHarnessFilters, type ListOptionHarnessFilters, MatListItemHarness, MatListOptionHarness, MatNavListHarness, MatNavListItemHarness, type NavListHarnessFilters, type NavListItemHarnessFilters } from '@angular/material/list/testing';
import { MatMenuHarness, MatMenuItemHarness, type MenuHarnessFilters, type MenuItemHarnessFilters } from '@angular/material/menu/testing';
import { MatRadioButtonHarness, MatRadioGroupHarness, type RadioButtonHarnessFilters, type RadioGroupHarnessFilters } from '@angular/material/radio/testing';
import { MatSelectHarness, type SelectHarnessFilters } from '@angular/material/select/testing';
import { MatSlideToggleHarness, type SlideToggleHarnessFilters } from '@angular/material/slide-toggle/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';


interface Chainer extends Cypress.Chainable<JQuery> {
    pipe: (fn: (root: JQuery) => Promise<ComponentHarness>) => ChainableHarness<ComponentHarness>;
}

interface AllChainer extends Cypress.Chainable<JQuery> {
    pipe: (fn: (root: JQuery) => Promise<unknown>) => ChainableHarness<ReadonlyArray<ComponentHarness>>;
}

/*
 * Adds harness methods to chainer.
 *
 * Given a harness with a `getValue()` method,
 * users can call `getHarness().getValue()`
 * instead of `getHarness().invoke('getValue')`
 */
const addHarnessMethodsToChainer = <HARNESS extends ComponentHarness>(chainableHarness: ChainableHarness<HARNESS>): ChainableHarness<HARNESS> => {
    type Target = (...args: Array<unknown>) => ChainableHarness<ComponentHarness>;

    const handler = {
        get: (chainableTarget: ChainableHarness<HARNESS>, prop: string) => (...args: Array<unknown>): ChainableHarness<ComponentHarness> => {
            /* Don't wrap cypress methods like `invoke`, `should` etc.... */
            if (prop in chainableTarget) {
                const pkey = prop as keyof ChainableHarness<HARNESS>;
                return (chainableTarget[pkey] as Target)(...args);
            }

            const propkey = prop as keyof HARNESS;
            const chainer = chainableTarget.then(target => {
                const fct2 = target[propkey] as Target;
                return fct2(...args);
            }) as unknown as ChainableHarness<ComponentHarness>;

            return addHarnessMethodsToChainer(chainer);
        }
    };

    return new Proxy<ChainableHarness<HARNESS>>(chainableHarness, handler);
};

const getDocumentRoot = (): Cypress.Chainable<JQuery<Element>> => cy.root<Element>();

const createRootEnvironment = ($documentRoot: JQuery<Element>): CypressHarnessEnvironment => {
    const documentRoot = $documentRoot.get(0);
    return new CypressHarnessEnvironment(documentRoot, { documentRoot });
};

export class CypressHarnessEnvironment extends HarnessEnvironment<Element> {
    /**
     * We need this to keep a reference to the document.
     * This is different to `rawRootElement` which is the root element
     * of the harness's environment.
     * (The harness's environment is more of a context)
     */
    private _documentRoot: Element;

    public constructor(rawRootElement: Element, { documentRoot }: { documentRoot: Element }) {
        super(rawRootElement);
        this._documentRoot = documentRoot;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async forceStabilize(): Promise<void> {
        console.warn('`HarnessEnvironment#forceStabilize()` was called but it is a noop in Cypress environment.');
    }

    public waitForTasksOutsideAngular(): Promise<void> {
        return Promise.reject(new Error('`HarnessEnvironment#waitForTasksOutsideAngular()` is not supported in Cypress environment.'));
    }

    protected getDocumentRoot(): Element {
        return this._documentRoot;
    }

    protected createTestElement(element: Element): TestElement {
        return new UnitTestElement(element, () => Promise.resolve());
    }

    protected createEnvironment(element: Element): HarnessEnvironment<Element> {
        return new CypressHarnessEnvironment(element, { documentRoot: this._documentRoot });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    protected async getAllRawElements(selector: string): Promise<Array<Element>> {
        return Array.from(this.rawRootElement.querySelectorAll(selector));
    }
}

export type ChainableHarness<HARNESS> = Cypress.Chainable<HARNESS> & {
    /* For each field or method... is this a method? */
    [K in keyof HARNESS]: HARNESS[K] extends (...args: any) => any
        ? /* It's a method so let's change the return type. */
        (
            ...args: Parameters<HARNESS[K]>
        ) => /* Convert Promise<T> to Chainable<T> and anything else U to Chainable<U>. */
        ChainableHarness<
        ReturnType<HARNESS[K]> extends Promise<infer RESULT>
            ? RESULT
            : HARNESS[K]
        >
        : /* It's something else. */
        HARNESS[K];
};

export const getHarness = <HARNESS extends ComponentHarness>(harnessQuery: HarnessQuery<HARNESS>): ChainableHarness<HARNESS> => {
    /* Create a local variable so `pipe` can log name. */
    const getHarnessFct = ($documentRoot: JQuery<Element>): Promise<HARNESS> => createRootEnvironment($documentRoot).getHarness(harnessQuery);

    return new Proxy<ChainableHarness<HARNESS>>({} as ChainableHarness<HARNESS>, {
        get: (_, prop): unknown => {
            const documentRoot = getDocumentRoot() as unknown as Chainer;
            const chainer = documentRoot.pipe(getHarnessFct);
            const method = addHarnessMethodsToChainer(chainer);
            const propKey = prop as keyof ChainableHarness<ComponentHarness>;
            return method[propKey];
        }
    });
};

export const getAllHarnesses = <HARNESS extends ComponentHarness>(query: HarnessQuery<HARNESS>): ChainableHarness<ReadonlyArray<HARNESS>> => {
    /* Create a local variable so `pipe` can log name. */
    const getAllHarnessesFct = ($documentRoot: JQuery<Element>): Promise<ReadonlyArray<HARNESS>> => createRootEnvironment($documentRoot).getAllHarnesses(query);

    return new Proxy({} as ChainableHarness<ReadonlyArray<HARNESS>>, {
        get: (_, prop): unknown => {
            const documentRoot = getDocumentRoot() as unknown as AllChainer;
            const method = documentRoot.pipe(getAllHarnessesFct);
            const propKey = prop as keyof ChainableHarness<ReadonlyArray<ComponentHarness>>;
            return method[propKey];
        }
    });
};

export const getInputHarness = (filter?: InputHarnessFilters | string): ChainableHarness<MatInputHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getInputHarness for selector ${options?.selector || MatInputHarness.hostSelector}`);
    const harnessQuery = MatInputHarness.with(options);
    return getHarness(harnessQuery);
};

export const getAutocompleteHarness = (filter?: AutocompleteHarnessFilters | string): ChainableHarness<MatAutocompleteHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getAutocompleteHarness for selector ${options?.selector || MatAutocompleteHarness.hostSelector}`);
    const harnessQuery = MatAutocompleteHarness.with(options);
    return getHarness(harnessQuery);
};

export const getListOptionHarness = (filter?: ListOptionHarnessFilters | string): ChainableHarness<MatListOptionHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getListOptionHarness for selector ${options?.selector || MatListOptionHarness.hostSelector}`);
    const harnessQuery = MatListOptionHarness.with(options);
    return getHarness(harnessQuery);
};

export const getButtonHarness = (filter?: ButtonHarnessFilters | string): ChainableHarness<MatButtonHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(`${options.selector}:not(disabled)`).first().should('be.visible');
    }
    cy.log(`getButtonHarness for selector ${options?.selector || MatButtonHarness.hostSelector}`);
    const harnessQuery = MatButtonHarness.with(options);
    return getHarness(harnessQuery);
};

export const getButtonToggleGroupHarness = (filter?: ButtonToggleGroupHarnessFilters | string): ChainableHarness<MatButtonToggleGroupHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getButtonToggleGroupHarness for selector ${options?.selector || MatButtonToggleGroupHarness.hostSelector}`);
    const harnessQuery = MatButtonToggleGroupHarness.with(options);
    return getHarness(harnessQuery);
};

export const getNavListHarness = (filter?: NavListHarnessFilters | string): ChainableHarness<MatNavListHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getNavListHarness for selector ${options?.selector || MatNavListHarness.hostSelector}`);
    const harnessQuery = MatNavListHarness.with(options);
    return getHarness(harnessQuery);
};

export const getNavListItemHarness = (filter?: NavListItemHarnessFilters | string): ChainableHarness<MatNavListItemHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter || {};
    if (!options.selector) {
        options.selector = 'mat-list-item';
    }
    cy.get(options.selector).first().scrollIntoView();
    cy.get(options.selector).first().should('be.visible');
    cy.log(`getNavListItemHarness for selector ${options.selector || MatNavListItemHarness.hostSelector}`);
    const harnessQuery = MatNavListItemHarness.with(options);
    return getHarness(harnessQuery);
};

export const getListItemHarness = (filter?: ListItemHarnessFilters | string): ChainableHarness<MatListItemHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter || {};
    if (!options.selector) {
        options.selector = 'mat-list-item';
    }
    cy.get(options.selector).first().scrollIntoView();
    cy.get(options.selector).first().should('be.visible');
    cy.log(`getListItemHarness for selector ${options.selector || MatListItemHarness.hostSelector}`);
    const harnessQuery = MatListItemHarness.with(options);
    return getHarness(harnessQuery);
};

export const getCheckBoxHarness = (filter?: CheckboxHarnessFilters | string): ChainableHarness<MatCheckboxHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getCheckBoxHarness for selector ${options?.selector || MatCheckboxHarness.hostSelector}`);
    const harnessQuery = MatCheckboxHarness.with(options);
    return getHarness(harnessQuery);
};

export const getRadioButtonHarness = (filter?: RadioButtonHarnessFilters | string): ChainableHarness<MatRadioButtonHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getRadioButtonHarness for selector ${options?.selector || MatRadioButtonHarness.hostSelector}`);
    const harnessQuery = MatRadioButtonHarness.with(options);
    return getHarness(harnessQuery);
};

export const getRadioGroupHarness = (filter?: RadioGroupHarnessFilters | string): ChainableHarness<MatRadioGroupHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getRadioGroupHarness for selector ${options?.selector || MatRadioGroupHarness.hostSelector}`);
    const harnessQuery = MatRadioGroupHarness.with(options);
    return getHarness(harnessQuery);
};

export const getMenuHarness = (filter?: MenuHarnessFilters | string): ChainableHarness<MatMenuHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getMenuHarness for selector ${options?.selector || MatMenuHarness.hostSelector}`);
    const harnessQuery = MatMenuHarness.with(options);
    return getHarness(harnessQuery);
};

export const getMenuItemHarness = (filter?: MenuItemHarnessFilters | string): ChainableHarness<MatMenuItemHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getMenuItemHarness for selector ${options?.selector || MatMenuItemHarness.hostSelector}`);
    const harnessQuery = MatMenuItemHarness.with(options);
    return getHarness(harnessQuery);
};

export const getDatePickerInputHarness = (filter?: DatepickerInputHarnessFilters | string): ChainableHarness<MatDatepickerInputHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getDatePickerInputHarness for selector ${options?.selector || MatDatepickerInputHarness.hostSelector}`);
    const harnessQuery = MatDatepickerInputHarness.with(options);
    return getHarness(harnessQuery);
};

export const getSlideToggleHarness = (filter?: SlideToggleHarnessFilters | string): ChainableHarness<MatSlideToggleHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getSlideToggleHarness for selector ${options?.selector || MatSlideToggleHarness.hostSelector}`);
    const harnessQuery = MatSlideToggleHarness.with(options);
    return getHarness(harnessQuery);
};

export const getSelectHarness = (filter?: SelectHarnessFilters | string): ChainableHarness<MatSelectHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter;
    if (options?.selector) {
        cy.get(options.selector).first().scrollIntoView();
        cy.get(options.selector).first().should('be.visible');
    }
    cy.log(`getSelectHarness for selector ${options?.selector || MatSelectHarness.hostSelector}`);
    const harnessQuery = MatSelectHarness.with(options);
    return getHarness(harnessQuery);
};

export const getOptionHarness = (filter?: OptionHarnessFilters | string): ChainableHarness<MatOptionHarness> => {
    const options = typeof filter === 'string' ? { selector: filter } : filter || {};
    if (!options.selector) {
        options.selector = 'mat-option';
    }
    cy.get(options.selector).first().scrollIntoView();
    cy.get(options.selector).should('be.visible');
    cy.log(`getOptionsHarness for selector ${options.selector || MatOptionHarness.hostSelector}`);
    const harnessQuery = MatOptionHarness.with(options);
    return getHarness(harnessQuery);
};
