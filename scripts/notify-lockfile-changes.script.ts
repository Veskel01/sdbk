const AVAILABLE_LOCK_FILES = ['bun.lock'];

console.log('🔒🔒🔒 Checking lock files 🔒🔒🔒\n');

if (process.argv.slice(2).some((arg) => AVAILABLE_LOCK_FILES.includes(arg))) {
  console.warn(
    [
      '⚠️ ----------------------------------------------------------------------------------------- ⚠️',
      `⚠️ ${AVAILABLE_LOCK_FILES.join(', ')} changed, please run \`bun install\` to ensure your packages are up to date. ⚠️`,
      '⚠️ ----------------------------------------------------------------------------------------- ⚠️'
    ].join('\n')
  );

  process.exit(1);
}

console.log('🔒🔒🔒 Lock files are up to date 👍');
process.exit(0);
