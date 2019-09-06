<template>
  <div class="Test">

    <div class="TestRunHeader">
      <div class="TestRunHeader-meta is-size-7 has-text-grey-light is-pulled-right">
        <span v-if="test.startedAt">
          {{humanize(test.startedAt)}}
        </span>
      </div>
      <div class="columns is-gapless">
        <div class="column is-narrow">
          <i v-if="test.result == 'passed'" class="fas fa-check has-text-success" />
          <i v-if="test.result == 'failed'" class="fas fa-times has-text-danger" />
          <i v-if="test.result == 'running'" class="fas fa-circle-notch fa-spin has-text-grey" />
        </div>
        <div class="column">
          <h3 class="TestRun-title" v-if="scenario">{{scenario.title}}</h3>
          <span class="tag is-light" :key="tag" v-for="tag in scenario.tags">{{tag}}</span>
        </div>
      </div>
    </div>

    <div class="tabs is-small">
      <ul>
        <li :class="{ 'is-active': activeTab == 'testrun' }" @click="activateTab('testrun')" ><a>Testrun</a></li>
        <li :class="{ 'is-active': activeTab == 'source' }" @click="activateTab('source')"><a>Source</a></li>
      </ul>
    </div>

    <div v-if="activeTab == 'source'">
      <ScenarioSource :source="scenario.body" />
    </div>

    <div v-if="activeTab == 'testrun'" class="TestrunStepsContainer">
      <ul class="TestRun-steps">
        <li 
          v-for="step in test.steps" 
          :key="step.title"
          @mouseover="setHoveredStep(step)"
          @mouseleave="unsetHoveredStep(step)"
        >
          <step
            :step="step"
            :isHovered="step === hoveredStep"
            :isSelected="step === selectedStep"
            @select-step="$emit('select-step', step)"
          />
        </li>
      </ul>

      <!-- TODO Create separate component -->
      <Cli />

      <TestResultMessage :test="test" />

      <div class="Test-spacer"></div>
    </div>

  </div>
</template>

<script>
import moment from 'moment';
import Step from './Step';
import ScenarioSource from './ScenarioSource';
import TestResultMessage from './TestResultMessage';
import Cli from './Cli';

export default {
  name: 'TestRun',
  props: ['test', 'scenario'],
  components: {
    Step, ScenarioSource, TestResultMessage, Cli
  },
  data: function () {
    return {
      activeTab: 'testrun',
      command: undefined,
    }
  },
  methods: {
    humanize(ts) {
      return moment.unix(ts / 1000).fromNow();
    },
    activateTab(tabname) {
      this.activeTab = tabname;
    },
    setHoveredStep(step) {
      this.$store.commit('testRunPage/setHoveredStep', step);
    },
    unsetHoveredStep(step) {
      this.$store.commit('testRunPage/unsetHoveredStep', step);
    }
  },
  computed: {
    hoveredStep() {
      return this.$store.getters['testRunPage/hoveredStep'];
    },
    selectedStep() {
      return this.$store.getters['testRunPage/selectedStep'];
    }
  }
}
</script>

<style scoped>
.TestRunHeader {

}

.TestRun-title {
  font-weight: bold;
  padding-left: .2em;
}

.TestRun-steps {
  line-height: 1em;
}

.Test-spacer {
  height: 2em;
  width: 100%;
}
</style>
