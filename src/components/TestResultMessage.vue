<template>
    <div class="TestResultMessage">
        <div v-if="test.result === 'failed'" class="Test-error notification is-danger">
            <p>
            {{trim(test.error.message)}}
            </p>
            <p>
            FAILED in {{test.duration}}s
            </p>
        </div>
        <div v-else-if="test.result === 'passed'" class="Test-passed notification is-success">
            PASSED in {{test.duration}}s
        </div>
    </div>
</template>

<script>
export default {
    name: 'TestResultMessage',
    props: ['test'],
    methods: {
        trim(str) {
        return str.trim();
        },
    }
}
</script>

<style>
.Test-error {
  font-family: Inconsolata, monospace;
  font-size:0.9rem;
  margin-top: .5em;
}

.Test-passed {
  font-family: Inconsolata, monospace;
  margin-top: .5em;
  font-size:0.9rem;
  padding: .5em;
}
</style>