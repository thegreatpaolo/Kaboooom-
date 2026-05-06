from django.test import TestCase
from .game_logic import (
    validate_word, calculate_score,
    generate_syllable, get_timer_for_difficulty
)


class GameLogicTests(TestCase):

    def test_valid_word_accepted(self):
        result = validate_word('standing', 'ST', [])
        self.assertTrue(result['valid'])

    def test_missing_syllable_rejected(self):
        result = validate_word('hello', 'ST', [])
        self.assertFalse(result['valid'])
        self.assertEqual(result['reason'], 'missing_syllable')

    def test_already_used_word_rejected(self):
        result = validate_word('standing', 'ST', ['standing'])
        self.assertFalse(result['valid'])
        self.assertEqual(result['reason'], 'already_used')

    def test_too_short_rejected(self):
        result = validate_word('a', 'AN', [])
        self.assertFalse(result['valid'])
        self.assertEqual(result['reason'], 'too_short')

    def test_score_short_word(self):
        self.assertEqual(calculate_score('cat'), 3)

    def test_score_medium_word(self):
        self.assertEqual(calculate_score('planet'), 7)

    def test_score_long_word(self):
        self.assertEqual(calculate_score('standing'), 12)

    def test_syllable_is_string(self):
        self.assertIsInstance(generate_syllable(), str)

    def test_easy_timer(self):
        self.assertEqual(get_timer_for_difficulty('easy'), 20)

    def test_hard_timer(self):
        self.assertEqual(get_timer_for_difficulty('hard'), 10)