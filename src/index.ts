import { After, Before, Given, Then, When } from 'cucumber';
import compareJson from './compare-json';
import { getCtx, getCtxItem, setCtx, setCtxItem } from './context';
import setupEntities from './entities';
import printOperators, { printError } from './operators/printer';
import setupRequireMock from './require';
import stepCtor from './steps/constructor';
import printSteps from './steps/printer';
import { Step, StepKind } from './steps/types';
import { Options, SetupFnArgs, StepDefinitionFn, TearDownFn } from './types';

export type Options = Options;

export type SetupFn = (args: SetupFnArgs) => void;

const getTearDown = () => getCtxItem<TearDownFn[]>('$tearDown');

After(() => getTearDown().reverse().forEach(fn => fn()));

const setup = (fn: SetupFn, options: Options = {}) => {
  const {
    aliases = {},
    entities,
    operators = {},
    requireMocks,
  } = options;

  Before(() => {
    const customCtx = options.initialContext && options.initialContext() || {};
    setCtx({
      ...customCtx,
      $tearDown: [],
    });
  });

  const createStep = stepCtor(operators, aliases, getCtx);

  const steps: Step[] = [];

  const step = (kind: StepKind): StepDefinitionFn => (...args) => {
    steps.push(...createStep(kind, ...args));
    return steps;
  };

  step('Given')(
    'variable {variable} is',
    (id, payload) => setCtxItem(id, payload),
    { inline: true },
  );

  const args: SetupFnArgs = {
    compare: (op, a, e) => {
      const error = compareJson(operators, op, a, e);
      if (error !== undefined) printError(error);
    },
    getCtx: getCtxItem,
    Given: step('Given'),
    onTearDown: fn => getTearDown().push(fn),
    setCtx: setCtxItem,
    Then: step('Then'),
    When: step('When'),
  };

  if (requireMocks) setupRequireMock(requireMocks);
  if (entities) setupEntities(entities, args);

  fn(args);

  console.log('Step reference');
  console.log('--------------');
  console.log(printSteps(steps));
  console.log();
  console.log('Operators');
  console.log('---------');
  console.log(printOperators(operators));

  steps.forEach((s) => {
    switch (s.kind) {
      case 'Given': return Given(s.regexp, s.fn);
      case 'Then': return Then(s.regexp, s.fn);
      case 'When': return When(s.regexp, s.fn);
    }
  });
};

export default setup;