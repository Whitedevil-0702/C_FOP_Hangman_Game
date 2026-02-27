#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

#define MAX_WORD_LENGTH 50
#define MAX_ATTEMPTS 6
#define MAX_WORDS 10

typedef enum {
    EASY,
    MEDIUM,
    HARD
} Difficulty;

typedef struct {
    char word[MAX_WORD_LENGTH];
    char hint[MAX_WORD_LENGTH];
} WordEntry;

// Word lists for different difficulty levels
WordEntry easy_words[MAX_WORDS] = {
    {"cat", "A common pet"},
    {"dog", "Man's best friend"},
    {"sun", "Star in the sky"},
    {"tree", "Plant with leaves"},
    {"book", "You read this"}
};

WordEntry medium_words[MAX_WORDS] = {
    {"programming", "Writing code"},
    {"computer", "Electronic device"},
    {"keyboard", "Input device"},
    {"algorithm", "Step-by-step procedure"},
    {"database", "Data storage system"}
};

WordEntry hard_words[MAX_WORDS] = {
    {"architecture", "Building design"},
    {"encyclopedia", "Reference book"},
    {"xylophone", "Musical instrument"},
    {"Byzantine", "Historical empire"},
    {"pseudonym", "False name"}
};

void display_hangman(int attempts_left) {
    int incorrect = MAX_ATTEMPTS - attempts_left;
    printf("\n");
    printf("  +---+\n");
    printf("  |   |\n");
    printf("  %s   |\n", (incorrect >= 1) ? "O" : " ");
    printf("  %s%s%s|\n", (incorrect >= 3) ? "/" : " ",
           (incorrect >= 2) ? "|" : " ",
           (incorrect >= 4) ? "\\" : " ");
    printf("  %s%s |\n", (incorrect >= 5) ? "/" : " ",
           (incorrect >= 6) ? "\\" : " ");
    printf("  |\n");
    printf("+=====+\n\n");
}

char* get_random_word(Difficulty level, char* hint) {
    WordEntry* word_list;
    int size = MAX_WORDS;
    
    switch (level) {
        case EASY:
            word_list = easy_words;
            break;
        case MEDIUM:
            word_list = medium_words;
            break;
        case HARD:
            word_list = hard_words;
            break;
        default:
            word_list = easy_words;
    }
    
    int random_index = rand() % size;
    strcpy(hint, word_list[random_index].hint);
    return word_list[random_index].word;
}

void display_word_state(const char* word, const char* guessed_letters) {
    for (int i = 0; word[i] != '\0'; i++) {
        if (strchr(guessed_letters, tolower(word[i])) != NULL) {
            printf("%c ", tolower(word[i]));
        } else {
            printf("_ ");
        }
    }
    printf("\n");
}

int is_word_guessed(const char* word, const char* guessed_letters) {
    for (int i = 0; word[i] != '\0'; i++) {
        if (strchr(guessed_letters, tolower(word[i])) == NULL) {
            return 0;
        }
    }
    return 1;
}

void play_hangman(Difficulty level) {
    char hint[MAX_WORD_LENGTH];
    char* word = get_random_word(level, hint);
    int word_length = strlen(word);
    char guessed_letters[26 + 1] = {0};
    int guessed_count = 0;
    int attempts_left = MAX_ATTEMPTS;
    
    printf("\n");
    printf("=============== HANGMAN GAME ===============\n");
    printf("Difficulty: %s\n", (level == EASY) ? "EASY" : (level == MEDIUM) ? "MEDIUM" : "HARD");
    printf("Hint: %s\n", hint);
    printf("Word length: %d letters\n", word_length);
    printf("Attempts left: %d\n", attempts_left);
    printf("===========================================\n\n");
    
    while (attempts_left > 0 && !is_word_guessed(word, guessed_letters)) {
        display_hangman(attempts_left);
        
        printf("Word: ");
        display_word_state(word, guessed_letters);
        
        printf("Guessed letters: %s\n", guessed_letters[0] ? guessed_letters : "None");
        printf("Attempts left: %d\n", attempts_left);
        
        printf("\nGuess a letter: ");
        char input[10];
        scanf("%s", input);
        
        char guess = tolower(input[0]);
        
        if (!isalpha(guess)) {
            printf("Please enter a valid letter!\n");
            continue;
        }
        
        if (strchr(guessed_letters, guess) != NULL) {
            printf("You already guessed '%c'!\n", guess);
            continue;
        }
        
        guessed_letters[guessed_count++] = guess;
        guessed_letters[guessed_count] = '\0';
        
        if (strchr(word, guess) == NULL) {
            printf("Wrong guess! '%c' is not in the word.\n", guess);
            attempts_left--;
        } else {
            printf("Good guess! '%c' is in the word!\n", guess);
        }
    }
    
    printf("\n");
    display_hangman(attempts_left);
    printf("Word: ");
    display_word_state(word, guessed_letters);
    
    if (is_word_guessed(word, guessed_letters)) {
        printf("\n🎉 Congratulations! You won! The word was: %s\n", word);
    } else {
        printf("\n😢 Game Over! The word was: %s\n", word);
    }
}

void show_menu() {
    printf("\n");
    printf("========== HANGMAN GAME ==========\n");
    printf("1. Easy\n");
    printf("2. Medium\n");
    printf("3. Hard\n");
    printf("4. Exit\n");
    printf("==================================\n");
    printf("Choose difficulty level (1-4): ");
}

int main() {
    srand(time(NULL));
    
    int choice;
    
    while (1) {
        show_menu();
        scanf("%d", &choice);
        
        switch (choice) {
            case 1:
                play_hangman(EASY);
                break;
            case 2:
                play_hangman(MEDIUM);
                break;
            case 3:
                play_hangman(HARD);
                break;
            case 4:
                printf("Thanks for playing! Goodbye!\n");
                return 0;
            default:
                printf("Invalid choice! Please try again.\n");
        }
    }
    
    return 0;
}