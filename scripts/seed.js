
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const lessons = [
  // Beginner
  { title: 'Greetings and Introductions', difficulty: 'Beginner' },
  { title: 'The Alphabet and Pronunciation', difficulty: 'Beginner' },
  { title: 'Numbers, Days, and Months', difficulty: 'Beginner' },
  { title: 'Basic Sentence Structure', difficulty: 'Beginner' },
  { title: 'Common Verbs (Ser, Estar, Tener)', difficulty: 'Beginner' },
  { title: 'Nouns and Gender', difficulty: 'Beginner' },
  { title: 'Adjectives and Agreement', difficulty: 'Beginner' },
  { title: 'Asking Questions', difficulty: 'Beginner' },
  { title: 'Family and Relationships', difficulty: 'Beginner' },
  { title: 'Food and Drinks', difficulty: 'Beginner' },

  // Intermediate
  { title: 'Present Tense Regular Verbs', difficulty: 'Intermediate' },
  { title: 'Present Tense Irregular Verbs', difficulty: 'Intermediate' },
  { title: 'Preterite Tense', difficulty: 'Intermediate' },
  { title: 'Imperfect Tense', difficulty: 'Intermediate' },
  { title: 'Direct and Indirect Object Pronouns', difficulty: 'Intermediate' },
  { title: 'Reflexive Verbs', difficulty: 'Intermediate' },
  { title: 'Gustar and Similar Verbs', difficulty: 'Intermediate' },
  { title: 'Por vs. Para', difficulty: 'Intermediate' },
  { title: 'Making Comparisons', difficulty: 'Intermediate' },
  { title: 'Travel and Directions', difficulty: 'Intermediate' },

  // Advanced
  { title: 'Subjunctive Mood: Present', difficulty: 'Advanced' },
  { title: 'Subjunctive Mood: Imperfect', difficulty: 'Advanced' },
  { title: 'The Conditional Tense', difficulty: 'Advanced' },
  { title: 'The Future Tense', difficulty: 'Advanced' },
  { title: 'Passive Voice', difficulty: 'Advanced' },
  { title: 'Reported Speech', difficulty: 'Advanced' },
  { title: 'Advanced Conjunctions', difficulty: 'Advanced' },
  { title: 'Idiomatic Expressions', difficulty: 'Advanced' },
  { title: 'Formal vs. Informal Speech', difficulty: 'Advanced' },
  { title: 'Spanish in the Workplace', difficulty: 'Advanced' },
];

async function seed() {
  // First, create a subject to associate the lessons with
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .insert([{ name: 'General Spanish', description: 'A general-purpose Spanish course.' }])
    .select()
    .single();

  if (subjectError) {
    console.error('Error creating subject:', subjectError);
    // Check if subject already exists
    if (subjectError.code === '23505') { // unique_violation
        const { data: existingSubject, error: existingSubjectError } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', 'General Spanish')
            .single();
        if (existingSubjectError) {
            console.error('Error fetching existing subject:', existingSubjectError);
            return;
        }
        await insertLessons(existingSubject.id);
    }
    return;
  }
  
  await insertLessons(subject.id);
}

async function insertLessons(subjectId) {
    const lessonsToInsert = lessons.map(lesson => ({ ...lesson, subject_id: subjectId }));

    const { error } = await supabase.from('lessons').insert(lessonsToInsert);

    if (error) {
        console.error('Error seeding lessons:', error);
    } else {
        console.log('Successfully seeded lessons.');
    }
}

seed();
