<template>
    <div class="InteractiveShell box" v-if="isShowCli">
        <div class="InteractiveShell-actions is-clearfix">
            <i class="InteractiveShell-closeButton fa fa-times is-pulled-right" v-on:click.once="closeInteractiveShell()" />
            <i class="InteractiveShell-nextStepButton fas fa-step-forward is-pulled-right" v-on:click="nextStep()"></i>
        </div>

        <article class="InteractiveShell-error message is-danger" v-if="hasErrorCli">
            <div class="message-header">
            <p>Command failed</p>
            </div>
            <div class="message-body">
            {{cliError}}
            </div>
        </article>

        <ul class="InteractiveShell-commands">
            <li v-on:click="execCommand('click')">
            <a href="">
                click
            </a>
            </li>
            <li>
            <a href="">
                fillField
            </a>
            </li>
            <li>
            <a href="">
                see
            </a>
            </li>
            <li>
            <a href="">
                other ...
            </a>

            <input 
                class="is-small input" 
                type="text" 
                placeholder="Enter CodeceptJS command" 
                v-model="command"  
                v-on:keyup.enter="sendCommand(command)" />
            </li>
        </ul>
    </div>
</template>
<script>
import Convert from 'ansi-to-html';

export default {
    name: 'Cli',
    computed: {
        isShowCli() {
        return this.$store.getters['cli/show'];
        },

        hasErrorCli() {
        return this.$store.state.cli && this.$store.state.cli.message;
        },

        cliPrompt() {
        return this.$store.state.cli.prompt;
        },

        cliError() {
        var convert = new Convert();

        return convert.toHtml(this.$store.state.cli.message);
        },
    },
    methods: {
        sendCommand(command) {
        this.$store.commit('clearCliError');
        this.$socket.emit('cli.line', command);
        },
        closeInteractiveShell() {
        this.$socket.emit('cli.line', 'exit');
        this.$store.commit('stopCli');
        },
        nextStep() {
        this.$socket.emit('cli.line', '');
        },
    }
}
</script>

<style>
.InteractiveShell {
  margin-top: 1em;
}

.InteractiveShell-error {
  margin-top: 1em;
  font-size:0.9rem;
}

.InteractiveShell-closeButton {
  cursor: pointer;
  margin-left: 1em;
}

.InteractiveShell-nextStepButton {
  cursor: pointer;
  margin-left: 1em;
}
</style>