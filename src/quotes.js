// src/quotes.js
// Array of quote objects: { text, author }


const quotes = [
  {
    text: "Wherever there is Krishna, the master of all mystics, and wherever there is Arjuna, the supreme archer, there will also surely be opulence, victory, extraordinary power, and morality.",
    author: "Bhagavad-gītā 18.78"
  },
  {
    text: "You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
    author: "Bhagavad-gītā 2.47"
  },
  {
    text: "A person is said to be elevated in yoga when, having renounced all material desires, he neither acts for sense gratification nor engages in fruitive activities.",
    author: "Bhagavad-gītā 6.4"
  },
  {
    text: "One who sees inaction in action, and action in inaction, is intelligent among men.",
    author: "Bhagavad-gītā 4.18"
  },
  {
    text: "In the mind of one who is thus satisfied, all dualities are gone, and he is freed from all doubts.",
    author: "Bhagavad-gītā 4.22"
  },
  {
    text: "There is nothing lost or diminished in this endeavor, and even a little advancement on this path can protect one from the most dangerous type of fear.",
    author: "Bhagavad-gītā 2.40"
  },
  {
    text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.",
    author: "Bhagavad-gītā 6.6"
  },
  {
    text: "He who is temperate in his habits of eating, sleeping, working and recreation can mitigate all material pains by practicing the yoga system.",
    author: "Bhagavad-gītā 6.17"
  },
  {
    text: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.",
    author: "Bhagavad-gītā 2.23"
  },
  {
    text: "As a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies, giving up the old and useless ones.",
    author: "Bhagavad-gītā 2.22"
  },
  {
    text: "The humble sage, by virtue of true knowledge, sees with equal vision a learned and gentle brāhmaṇa, a cow, an elephant, a dog and a dog-eater.",
    author: "Bhagavad-gītā 5.18"
  },
  {
    text: "Perform your prescribed duty, for action is better than inaction. A man cannot even maintain his physical body without work.",
    author: "Bhagavad-gītā 3.8"
  },
  {
    text: "Whatever action is performed by a great man, common men follow. And whatever standards he sets by exemplary acts, all the world pursues.",
    author: "Bhagavad-gītā 3.21"
  },
  {
    text: "The mind is restless, turbulent, obstinate and very strong, O Krishna, and to subdue it, I think, is more difficult than controlling the wind.",
    author: "Bhagavad-gītā 6.34"
  },
  {
    text: "He who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, is very dear to Me.",
    author: "Bhagavad-gītā 12.13-14"
  },
  {
    text: "Those who are motivated only by desire for the fruits of action are miserable, for they are constantly anxious about the results of what they do.",
    author: "Bhagavad-gītā 2.49"
  },
  {
    text: "One who neither rejoices upon achieving something pleasant nor laments upon obtaining something unpleasant, who is self-intelligent, unbewildered, and who knows the science of God, is to be understood as already situated in transcendence.",
    author: "Bhagavad-gītā 5.20"
  },
  {
    text: "The yogi who knows that I and the Supersoul within all creatures are one, worships Me and remains always in Me in all circumstances.",
    author: "Bhagavad-gītā 6.31"
  },
  {
    text: "A person who is not disturbed by the incessant flow of desires—that enter like rivers into the ocean, which is ever being filled but is always still—can alone achieve peace.",
    author: "Bhagavad-gītā 2.70"
  },
  {
    text: "The peace formula: A person in full consciousness of Me, knowing Me to be the ultimate beneficiary of all sacrifices and austerities, the Supreme Lord of all planets and demigods, and the benefactor and well-wisher of all living entities, attains peace from the pangs of material miseries.",
    author: "Bhagavad-gītā 5.29"
  },
  {
    text: "He who has no attachments can really love others, for his love is pure and divine.",
    author: "Bhagavad-gītā 2.55"
  },
  {
    text: "The senses are so strong and impetuous, O Arjuna, that they forcibly carry away the mind even of a man of discrimination who is endeavoring to control them.",
    author: "Bhagavad-gītā 2.60"
  },
  {
    text: "The person who is not disturbed by happiness and distress and is steady in both is certainly eligible for liberation.",
    author: "Bhagavad-gītā 2.15"
  },
  {
    text: "He who is able to withdraw his senses from sense objects, as the tortoise draws its limbs within the shell, is firmly fixed in perfect consciousness.",
    author: "Bhagavad-gītā 2.58"
  },
  {
    text: "The embodied soul may be restricted from sense enjoyment, though the taste for sense objects remains. But, ceasing such engagements by experiencing a higher taste, he is fixed in consciousness.",
    author: "Bhagavad-gītā 2.59"
  },
  {
    text: "For one who is so situated in the divine consciousness, the threefold miseries of material existence exist no longer.",
    author: "Bhagavad-gītā 6.23"
  },
  {
    text: "He who is satisfied with gain which comes of its own accord, who is free from duality and does not envy, who is steady in both success and failure, is never entangled, although performing actions.",
    author: "Bhagavad-gītā 4.22"
  },
  {
    text: "The wise, engaged in devotional service, take refuge in the Lord and are freed from the cycle of birth and death, attaining that state beyond all miseries.",
    author: "Bhagavad-gītā 2.51"
  },
  {
    text: "The living entities in this conditioned world are My eternal, fragmental parts. Due to conditioned life, they are struggling very hard with the six senses, which include the mind.",
    author: "Bhagavad-gītā 15.7"
  },
  {
    text: "He who is not disturbed by the incessant flow of desires—that enter like rivers into the ocean, which is ever being filled but is always still—can alone achieve peace.",
    author: "Bhagavad-gītā 2.70"
  },
  {
    text: "The yogi who is satisfied with knowledge and realization, who is self-controlled, and who sees everything equally, is said to be situated in transcendence.",
    author: "Bhagavad-gītā 6.8"
  },
  {
    text: "The Supreme Personality of Godhead said: Fearlessness; purification of one's existence; cultivation of spiritual knowledge; charity; self-control; performance of sacrifice; study of the Vedas; austerity; simplicity; nonviolence; truthfulness; freedom from anger; renunciation; tranquility; aversion to faultfinding; compassion for all living entities; freedom from covetousness; gentleness; modesty; steady determination; vigor; forgiveness; fortitude; cleanliness; and freedom from envy and from the passion for honor—these transcendental qualities, O son of Bharata, belong to godly men endowed with divine nature.",
    author: "Bhagavad-gītā 16.1-3"
  },
  {
    text: "He who meditates on Me as the Supreme Personality of Godhead, his mind constantly engaged in remembering Me, undiverted from the path, he, O Arjuna, is sure to reach Me.",
    author: "Bhagavad-gītā 8.8"
  },
  {
    text: "The unsuccessful yogi, after many, many years of enjoyment on the planets of the pious living entities, is born into a family of righteous people, or into a family of rich aristocracy.",
    author: "Bhagavad-gītā 6.41"
  },
  {
    text: "The yogi is greater than the ascetic, greater than the empiricist and greater than the fruitive worker. Therefore, O Arjuna, in all circumstances, be a yogi.",
    author: "Bhagavad-gītā 6.46"
  },
  {
    text: "He who is not affected by honor or dishonor, who is equal to friend and enemy, and who is renounced, is very dear to Me.",
    author: "Bhagavad-gītā 12.19"
  },
  {
    text: "The person who is not disturbed by happiness and distress and is steady in both is certainly eligible for liberation.",
    author: "Bhagavad-gītā 2.15"
  },
  {
    text: "The one who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, is very dear to Me.",
    author: "Bhagavad-gītā 12.13-14"
  },
  {
    text: "The yogi who is satisfied with knowledge and realization, who is self-controlled, and who sees everything equally, is said to be situated in transcendence.",
    author: "Bhagavad-gītā 6.8"
  },
  {
    text: "The wise, engaged in devotional service, take refuge in the Lord and are freed from the cycle of birth and death, attaining that state beyond all miseries.",
    author: "Bhagavad-gītā 2.51"
  },
  {
    text: "The living entities in this conditioned world are My eternal, fragmental parts. Due to conditioned life, they are struggling very hard with the six senses, which include the mind.",
    author: "Bhagavad-gītā 15.7"
  },
  {
    text: "He who is not disturbed by the incessant flow of desires—that enter like rivers into the ocean, which is ever being filled but is always still—can alone achieve peace.",
    author: "Bhagavad-gītā 2.70"
  },
  {
    text: "The yogi who is satisfied with knowledge and realization, who is self-controlled, and who sees everything equally, is said to be situated in transcendence.",
    author: "Bhagavad-gītā 6.8"
  },
  {
    text: "The Supreme Personality of Godhead said: Fearlessness; purification of one's existence; cultivation of spiritual knowledge; charity; self-control; performance of sacrifice; study of the Vedas; austerity; simplicity; nonviolence; truthfulness; freedom from anger; renunciation; tranquility; aversion to faultfinding; compassion for all living entities; freedom from covetousness; gentleness; modesty; steady determination; vigor; forgiveness; fortitude; cleanliness; and freedom from envy and from the passion for honor—these transcendental qualities, O son of Bharata, belong to godly men endowed with divine nature.",
    author: "Bhagavad-gītā 16.1-3"
  }
];

export default quotes;
