/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentHarness } from '@angular/cdk/testing';

import { CypressHarnessEnvironment } from './cypress-harness-environment.js';

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

/*
 * Adds harness methods to chainer.
 *
 * Given a harness with a `getValue()` method,
 * users can call `getHarness().getValue()`
 * instead of `getHarness().invoke('getValue')`
 */
export const addHarnessMethodsToChainer = <HARNESS extends ComponentHarness>(chainableHarness: ChainableHarness<HARNESS>): ChainableHarness<HARNESS> => {
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

export const getDocumentRoot = (): Cypress.Chainable<JQuery<Element>> => cy.root<Element>();

export const createRootEnvironment = ($documentRoot: JQuery<Element>): CypressHarnessEnvironment => {
    const documentRoot = $documentRoot.get(0);
    return new CypressHarnessEnvironment(documentRoot, { documentRoot });
};
