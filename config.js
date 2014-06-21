/**
 * configs and constants
 */

module.exports = {
	// process exit code
	ERROR_EXIT: 1,
	SUCCESS_EXIT: 0,

	// available hooks
	AVAILABLE_HOOKS: ['applypatch-msg', 'pre-applypatch', 
		'post-applypatch', 'pre-commit', 'prepare-commit-msg', 
		'commit-msg', 'post-commit', 'pre-rebase', 
		'post-checkout', 'post-merge', 'pre-receive', 
		'update', 'post-receive', 'post-update', 
		'pre-auto-gc', 'post-rewrite', 'pre-push']
};