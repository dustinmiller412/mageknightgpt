import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
        "If I go down a dungeon during the day, can I use black mana from the source?",
        "If I attack a city, can I choose to fight only some of the enemies?",
        "What do the 3 small coloured circles mean on the bottom of the Hero card?",
        "If you defeat all enemies in the block phase using special abilities, do you still proceed to the attack phase?"
    ]

    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) =>
                <PromptSuggestionButton
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />)}
        </div>
    )
}

export default PromptSuggestionsRow;