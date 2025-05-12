import { HarnessEnvironment, type TestElement } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';

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
