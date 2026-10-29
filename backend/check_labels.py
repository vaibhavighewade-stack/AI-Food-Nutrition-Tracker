
from transformers import AutoConfig

config = AutoConfig.from_pretrained(
    "prithivMLmods/Indian-Western-Food-34"
)

for i, label in config.id2label.items():
    print(i, label)