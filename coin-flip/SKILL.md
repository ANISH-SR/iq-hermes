---
name: coin-flip
description: Flip a coin to make decisions. Use when you need a random yes/no or heads/tails answer.
license: MIT
metadata:
  author: iq-labs-demo
  version: "1.0.0"
  hermes:
    tags: [random, decision, fun]
    category: utility
---

# Coin Flip Skill

Flip a virtual coin for random decisions.

## When to Use
- Need a random yes/no answer
- Making a binary choice
- Settling a debate
- Quick decision making

## Procedure

### Simple Coin Flip

```bash
# Returns heads or tails
echo "heads" | shuf -n 1 -e heads tails
```

### With Best of 3

```bash
# Best of 3 flips
for i in 1 2 3; do
  echo "Flip $i: $(shuf -n 1 -e heads tails)"
done
```

### Decision Mode

```bash
# Assign options to heads/tails
heads_option="Option A"
tails_option="Option B"
result=$(shuf -n 1 -e heads tails)
echo "Result: $result"
echo "Winner: $(eval echo "\$${result}_option")"
```

## Python Version

```python
import random
result = random.choice(['heads', 'tails'])
print(f"Coin flip: {result}")
```

## Pitfalls
- Not cryptographically secure (use for casual decisions only)
- No persistent history
- Purely random, no weighting

## Verification
Run multiple times to verify randomness distribution.
