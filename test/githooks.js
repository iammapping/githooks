var should = require('should'),
    sinon = require('sinon'),
    githooks = require('../githooks.js');

describe('sync mode', function() {
    describe('hook match', function() {
        it('match "bin", match any, ever', function() {
            githooks.removeHook('pre-commit');

            var spyMatchBin = sinon.spy(),
                spyMatch = sinon.spy(),
                spyEver = sinon.spy();

            githooks.hook('pre-commit', {
                'bin': 'bin/git-hooks'
            }).on('match:bin', spyMatchBin)
            .on('match:bin', spyMatchBin)
            .on('match', spyMatch)
            .on('all', spyEver);

            githooks.trigger('pre-commit', ['bin/git-hooks']);

            spyMatchBin.called.should.be.true;
            spyMatchBin.callCount.should.equal(2);
            spyMatchBin.calledBefore(spyMatch).should.be.true;
            spyMatch.called.should.be.true;
            spyMatch.calledBefore(spyEver).should.be.true;
            spyEver.called.should.be.true;
        });
    });

    describe('hook not match', function() {
        it('not match "bin", not match any, ever', function() {
            githooks.removeHook('pre-commit');

            var spyMatchBin = sinon.spy(),
                spyMatch = sinon.spy(),
                spyEver = sinon.spy();

            githooks.hook('pre-commit', {
                'bin': 'bin/git-hooks'
            }).on('match:bin', spyMatchBin)
            .on('match', spyMatch)
            .on('all', spyEver);

            githooks.trigger('pre-commit', ['some/files']);

            spyMatchBin.called.should.be.false;
            spyMatch.called.should.be.false;
            spyEver.called.should.be.true;
        });
    });
});

describe('async mode', function() {
    describe('hook match', function() {
        it('match "bin", match any, ever(in series)', function() {
            githooks.removeHook('pre-commit');

            var clock = sinon.useFakeTimers(),
                spyMatchBin = sinon.spy(),
                spyMatch = sinon.spy(),
                spyEver = sinon.spy();

            githooks.hook('pre-commit', {
                'bin': 'bin/git-hooks'
            }).on('match:bin', function(f, next) {
                setTimeout(function() {
                    spyMatchBin();
                    next();
                }, 1000);
            }).on('match:bin', function(f, next) {
                setTimeout(function() {
                    spyMatchBin();
                    next();
                }, 1000);
            }).on('match', spyMatch)
            .on('all', spyEver);

            githooks.trigger('pre-commit', ['bin/git-hooks']);

            clock.tick(999);
            spyMatchBin.called.should.be.false;
            spyMatch.called.should.be.false;
            spyEver.called.should.be.false;

            clock.tick(1);
            spyMatchBin.called.should.be.true;
            spyMatchBin.callCount.should.equal(1);
            spyMatch.called.should.be.false;
            spyEver.called.should.be.false;

            clock.tick(1000);
            spyMatchBin.callCount.should.equal(2);
            spyMatch.called.should.be.true;
            spyEver.called.should.be.true;

            clock.restore();
        });
    });
});

