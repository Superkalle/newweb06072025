# Gemini settings for cost optimization

# Model selection: Use a model that offers a good balance of performance and cost.
# gemini-1.5-flash is generally faster and more cost-effective for many tasks.
model: gemini-1.5-flash

# Temperature: Lowering the temperature can lead to more focused and less random output,
# which can sometimes reduce the number of tokens used to get a good answer.
# A value between 0.2 and 0.5 is often a good starting point for cost-conscious use cases.
temperature: 0.2

# Max Output Tokens: Limiting the maximum number of tokens in the output can prevent
# overly long and expensive responses. Set this to a reasonable value based on your needs.
max_output_tokens: 2048

# Other potential considerations (optional):
# - Caching: If you frequently ask the same questions, implementing a caching layer
#   on your end can save costs by reusing previous answers.
# - Prompt engineering: Writing clear and concise prompts can help the model
#   generate the desired output more efficiently, using fewer tokens.
