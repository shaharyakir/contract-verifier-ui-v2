# Contributing to func-js

We highly appreciate any contribution to func-js ❤️

## A typical workflow

1) Make sure your fork is up to date with the main repository:

```
cd ton-compiler
git remote add upstream https://github.com/ton-community/ton-compiler.git
git fetch upstream
git pull --rebase upstream master
```

NOTE: The directory `ton-compiler` represents your fork's local copy.

2) Branch out from `master` into `fix/some-bug-#123` or `feat/some-feat` for features:
Postfixing #123 will associate your PR with the issue #123 and make everyone's life easier
```
git checkout -b fix/some-bug-#123
```

3) Make your changes, add your files, commit, and push to your fork.

```
git add SomeFile.js
git commit "Fix some bug #123"
git push origin fix/some-bug-#123
```

4) Make sure tests pass:

```bash
yarn test
```

5) Go to [github.com/ton-community/ton-compiler](https://github.com/ton-community/ton-compiler) in your web browser and issue a new pull request.

*IMPORTANT* Read the PR template very carefully and make sure to follow all the instructions.

6) Maintainers will review your code and possibly ask for changes before your code is pulled in to the main repository. We'll check that all tests pass, review the coding style, and check for general code correctness. If everything is OK, we'll merge your pull request and your code will be part of ton-compiler.

## All set!

If you have any questions, feel free to join ton-community dev chat at Telegram: https://t.me/ton_dev_community.

Thanks for your time and code!

