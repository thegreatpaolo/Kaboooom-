import random
import os

SYLLABLES = [
    'AN', 'IN', 'ER', 'ON', 'AT', 'BR', 'CH', 'PL', 'ST', 'TR',
    'OT', 'IT', 'UN', 'OR', 'AR', 'AL', 'EN', 'IC', 'OW', 'AY',
    'EAR', 'OUR', 'AIN', 'ING', 'ONG', 'ANG', 'ENT', 'EST', 'OOK',
    'ACK', 'ALL', 'AND', 'END', 'OLD', 'OWN', 'OUT', 'INT', 'ACT',
]

WORD_LIST_PATH = os.path.join(os.path.dirname(__file__), 'wordlist.txt')


def load_words() -> set:
    """Load the dictionary from file into a set for O(1) lookup."""
    try:
        with open(WORD_LIST_PATH, 'r', encoding='utf-8') as f:
            words = set(line.strip().lower() for line in f if line.strip())
        print(f'[WORDLIST] Loaded {len(words):,} words.')
        return words
    except FileNotFoundError:
        print('[WORDLIST] WARNING: wordlist.txt not found. Validation disabled.')
        return set()


WORD_LIST = load_words()


def validate_word(word: str, syllable: str, used_words: list) -> dict:
    """
    Validates a submitted word against three rules:
    1. Not already used this round
    2. Contains the required syllable
    3. Exists in the dictionary
    Returns a dict with 'valid' bool and 'reason' string.
    """
    word = word.strip().lower()
    syllable = syllable.strip().lower()

    if len(word) < 2:
        return {'valid': False, 'reason': 'too_short'}
    if word in used_words:
        return {'valid': False, 'reason': 'already_used'}
    if syllable not in word:
        return {'valid': False, 'reason': 'missing_syllable'}
    if WORD_LIST and word not in WORD_LIST:
        return {'valid': False, 'reason': 'not_a_word'}

    return {'valid': True, 'reason': 'ok'}


def generate_syllable() -> str:
    """Picks a random syllable for the next turn."""
    return random.choice(SYLLABLES)


def calculate_score(word: str) -> int:
    """
    Score = word length + bonus for long words.
    Encourages players to use longer, harder words.
    """
    length = len(word)
    if length >= 10:
        return length + 5
    elif length >= 8:
        return length + 3
    elif length >= 6:
        return length + 1
    return length


def get_timer_for_difficulty(difficulty: str, custom_timer: int = None) -> int:
    if custom_timer is not None:
        return max(1, min(30, custom_timer))
    return 10 if difficulty == 'hard' else 20