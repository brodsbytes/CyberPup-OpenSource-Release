const { DetoxCircusEnvironment, SpecReporter, WorkerAssignReporter } = require('detox/runners/jest');

class CustomDetoxEnvironment extends DetoxCircusEnvironment {
  constructor(config, context) {
    super(config, context);

    this.initTimeout = 300000;
    this.launchApp = 'auto';
    this.reuse = false;

    // Can be safely removed, if you are using the default `--take-screenshots all` option.
    // this.artifacts = {
    //   plugins: {
    //     screenshot: {
    //       enabled: true,
    //       shouldTakeAutomaticSnapshots: true,
    //       keepOnlyFailedTestsArtifacts: true,
    //     },
    //   },
    // };
  }

  async handleTestEvent(event, state) {
    // See: https://github.com/jestjs/jest/blob/master/packages/jest-circus/src/eventHandler.ts
    await super.handleTestEvent(event, state);
  }
}

module.exports = CustomDetoxEnvironment;
