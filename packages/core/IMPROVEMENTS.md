# Proponowane ulepszenia parsera

## 1. Obsługa komentarzy w stringach ⚠️ KRYTYCZNE

**Problem:** Obecna implementacja `RemoveLineComments` i `RemoveBlockComments` usuwa komentarze nawet wewnątrz stringów:
```typescript
// Błędnie usuwa komentarz z stringa:
DEFINE FIELD name ON user TYPE string VALUE "text -- comment"
```

**Rozwiązanie:** Dodać obsługę stringów przed usuwaniem komentarzy:
- Obsługa stringów w pojedynczych cudzysłowach: `'text -- comment'`
- Obsługa stringów w podwójnych cudzysłowach: `"text -- comment"`
- Obsługa escape sequences: `"text \\" -- comment"`

## 2. Obsługa zagnieżdżonych komentarzy blokowych

**Problem:** Zagnieżdżone komentarze mogą powodować problemy:
```sql
/* outer /* inner */ comment */
```

**Rozwiązanie:** Dodać licznik głębokości zagnieżdżenia.

## 3. Obsługa record types z pipe separator

**Problem:** SurrealDB wspiera `record<user|post>` dla union types, ale parser obecnie tylko wyciąga pierwszą tabelę:
```typescript
type _ExtractTableName<S extends string> = Trim<S> extends `${infer T}|${string}`
  ? Lowercase<Trim<T>>  // Tylko pierwsza tabela!
  : Lowercase<Trim<S>>;
```

**Rozwiązanie:** Zwracać union type dla wielu tabel:
```typescript
type Result = ParseType<'record<user|post>'>;
// Powinno być: RecordId<'user'> | RecordId<'post'>
```

## 4. Obsługa złożonych zagnieżdżonych typów

**Problem:** Bardzo głębokie zagnieżdżenia mogą powodować błędy TypeScript:
```typescript
type Deep = ParseType<'array<option<array<option<record<user>>>>>>';
```

**Rozwiązanie:**
- Dodać testy dla głębokich zagnieżdżeń
- Zoptymalizować rekurencyjne typy
- Dodać limity głębokości z informacyjnymi błędami

## 5. Lepsze komunikaty błędów

**Problem:** Gdy parser zwraca `never`, nie ma informacji dlaczego:
```typescript
type Result = ParseStatement<'DEFINE INVALID user'>; // never - bez informacji dlaczego
```

**Rozwiązanie:** Dodać branded error types:
```typescript
type ParseError<T extends string> = {
  __error: true;
  message: T;
  input: string;
};
```

## 6. Obsługa array/set z parametrami

**Problem:** SurrealDB wspiera `array<T, N>` i `set<T, N>` dla maksymalnych rozmiarów, ale parser ich nie obsługuje:
```typescript
type Result = ParseType<'array<string, 100>'>; // Powinno być: string[]
```

**Rozwiązanie:** Dodać obsługę opcjonalnego drugiego parametru w `_StripExtraParams`.

## 7. Obsługa geometry subtypes

**Problem:** Geometry types mogą mieć subtypes (`geometry<point>`, `geometry<line>`), ale parser zwraca tylko `GeoJSON`.

**Rozwiązanie:** Dodać bardziej szczegółowe typy dla geometry subtypes.

## 8. Obsługa range types

**Problem:** SurrealDB wspiera `range<int>`, `range<float>`, ale parser ich nie obsługuje.

**Rozwiązanie:** Dodać obsługę range types do `TypeMap` i `_MapType`.

## 9. Obsługa duration subtypes

**Problem:** Duration może mieć subtypes (`duration<year>`, `duration<day>`), ale parser zwraca tylko `string`.

**Rozwiązanie:** Rozważyć bardziej szczegółowe typy dla duration.

## 10. Optymalizacja wydajności typów

**Problem:** Niektóre rekurencyjne typy mogą być wolne dla dużych schematów.

**Rozwiązanie:**
- Dodać memoization dla często używanych typów
- Użyć conditional types zamiast rekurencji gdzie możliwe
- Dodać benchmarki wydajności

## 11. Testy dla edge cases

**Brakujące testy:**
- Komentarze w stringach
- Zagnieżdżone komentarze
- Escape sequences w stringach
- Bardzo długie schematy (>1000 linii)
- Unicode characters w nazwach tabel/pól
- Specjalne znaki w nazwach

## 12. Dokumentacja

**Brakuje:**
- JSDoc dla wszystkich publicznych typów
- Przykłady użycia w dokumentacji
- Opis ograniczeń parsera
- Przewodnik migracji dla użytkowników

## 13. Obsługa VIEW statements

**Problem:** SurrealDB wspiera `DEFINE TABLE ... AS SELECT ...`, ale parser może nie obsługiwać wszystkich przypadków.

**Rozwiązanie:** Dodać testy i poprawić obsługę VIEW statements.

## 14. Walidacja nazw tabel/pól

**Problem:** Niektóre nieprawidłowe nazwy mogą przejść przez parser.

**Rozwiązanie:** Dodać walidację zgodnie z regułami SurrealDB:
- Nazwy nie mogą zaczynać się od cyfr
- Nazwy nie mogą zawierać niektórych znaków specjalnych
- Nazwy muszą być niepuste

## 15. Obsługa parametrów w funkcjach

**Problem:** Funkcje mogą mieć opcjonalne parametry z wartościami domyślnymi, ale parser może ich nie obsługiwać poprawnie.

**Rozwiązanie:** Dodać testy i poprawić parsowanie parametrów funkcji.

## Priorytetyzacja

### Wysoki priorytet (krytyczne błędy):
1. ✅ Obsługa komentarzy w stringach
2. ✅ Obsługa record types z pipe separator
3. ✅ Lepsze komunikaty błędów

### Średni priorytet (ważne funkcje):
4. Obsługa array/set z parametrami
5. Obsługa złożonych zagnieżdżonych typów
6. Testy dla edge cases

### Niski priorytet (nice to have):
7. Optymalizacja wydajności
8. Dokumentacja
9. Obsługa geometry/duration subtypes
10. Obsługa range types
