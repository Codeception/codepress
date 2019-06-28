import Vue from 'vue'
import Vuex from 'vuex'

const store = new Vuex.Store({
    state: {
        lastSnapshot: undefined,
        selectedStep: undefined,
        tests: []
    },
    mutations: {
      clearTests: (state) => {
        state.tests = [];
        state.selectedStep = undefined;
      },
      addTest: (state, test) => {
        Vue.set(test, 'steps', [])
        Vue.set(test, 'result', 'running');
        Vue.set(state, 'tests', [...state.tests, test])
      },
      addStepToCurrentTest: (state, step) => {
        const currentTest = state.tests[state.tests.length - 1];
  
        if (step.snapshot) {
          state.lastSnapshot = step.snapshot;
        } else {
          Vue.set(step, 'snapshot', state.lastSnapshot);
        }
        Vue.set(step, 'result', 'passed');
        currentTest.steps.push(step);
      },
      markAsFailedCurrentTest: (state, errorAndSnapshot) => {
        const currentTest = state.tests[state.tests.length - 1];
        const currentStep = currentTest.steps[currentTest.steps.length - 1];
  
        currentTest.result = 'failed';
        Vue.set(currentTest, 'error', errorAndSnapshot.error);
        Vue.set(currentStep, 'snapshot', errorAndSnapshot.snapshot);
        Vue.set(currentStep, 'result', 'failed');
      },
      markAsPassedCurrentTest: (state) => {
        const currentTest = state.tests[state.tests.length - 1];
        currentTest.result = 'passed';
      },
      setSelectedStep: (state, selectedStep) => {
        if (!selectedStep) return;
  
        state.selectedStep = selectedStep;
      },
      setRunning: (state, isRunning) => {
        state.isRunning = isRunning;
      }
    }
});

export default store;