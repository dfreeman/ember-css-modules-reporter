'use strict';

const chalk = require('chalk');
const table = require('text-table');

// Largely derived from ESLint's "stylish" formatter
// https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js

module.exports = function formatMessages(results) {
  let output = '';
  let errors = 0;
  let warnings = 0;
  let summaryColor = 'yellow';

  for (let file of results.keys()) {
    let messages = results.get(file);
    if (!messages.length) { continue; }

    output += `\n${chalk.underline(file)}\n`;
    output += prettyTable(messages.map((message) => {
      let messageType = message.severity || message.type;
      if (messageType === 'error') {
        errors += 1;
        summaryColor = 'red';
        messageType = chalk.red(messageType);
      } else {
        warnings += 1;
        messageType = chalk.yellow(messageType);
      }

      // when you have a rule with invalid options,
      // line and column are undefined
      // which causes the table formatter to throw
      let line = message.line || '';
      let column = message.column || '';

      return [
        '',
        line,
        column,
        messageType,
        message.text,
        chalk.dim(message.plugin)
      ];
    }),
    {
      align: ['', 'r', 'l'],
      stringLength(str) {
        return chalk.stripColor(str).length;
      }
    });
    output += '\n';
  }

  let total = errors + warnings;
  if (total > 0) {
    return output + chalk[summaryColor].bold(
      `\n${pluralize(total, 'problem')} (${pluralize(errors, 'error')} and ${pluralize(warnings, 'warning')})`
    );
  }
}

function prettyTable(messageRows) {
  return table(messageRows)
    .split('\n')
    .map(realignLocation)
    .join('\n');
}

function realignLocation(row) {
  return row.replace(/(\d+)\s+(\d+)/, (match, row, col) => chalk.dim(`${row}:${col}`));
}

function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? '' : 's'}`;
}
