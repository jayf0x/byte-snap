# Backlog

1. **Generic default title makes multiple `diff().print()` calls indistinguishable in logs.** `print(title = 'byte-snap')` ([src/diff.js:30](src/diff.js:30)) means any caller that forgets (or doesn't bother) to pass a title looks identical to every other byte-snap consumer in the same build output — a real plugin's diff got mistaken for noise because of this. Consider requiring/encouraging a label in docs, or warning when two default-titled reports print in the same run.
