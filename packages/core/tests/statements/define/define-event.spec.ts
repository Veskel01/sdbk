import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema } from '../../../src';

describe('DEFINE EVENT', () => {
  describe('Basic event definitions', () => {
    it('extracts event definition', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE user SCHEMAFULL;
        DEFINE EVENT user_created ON user
      `>;

      expectTypeOf<Schema['events']['user_created']>().toMatchTypeOf<{
        name: 'user_created';
        table: 'user';
      }>();
    });

    it('extracts multiple events', () => {
      type Schema = ParseSchema<`
        DEFINE TABLE order SCHEMAFULL;
        DEFINE EVENT order_created ON order;
        DEFINE EVENT order_updated ON order;
        DEFINE EVENT order_deleted ON order
      `>;

      expectTypeOf<Schema['events']['order_created']['name']>().toEqualTypeOf<'order_created'>();
      expectTypeOf<Schema['events']['order_updated']['name']>().toEqualTypeOf<'order_updated'>();
      expectTypeOf<Schema['events']['order_deleted']['name']>().toEqualTypeOf<'order_deleted'>();
    });

    it('extracts event with ON TABLE syntax', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT user_updated ON TABLE user THEN {}
      `>;

      expectTypeOf<Schema['events']['user_updated']['table']>().toEqualTypeOf<'user'>();
    });
  });

  describe('Event clauses', () => {
    it('extracts event with WHEN clause', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT email_changed ON user WHEN $before.email != $after.email THEN {}
      `>;

      expectTypeOf<
        Schema['events']['email_changed']['when']
      >().toEqualTypeOf<'$before.email != $after.email'>();
    });

    it('extracts event with THEN clause', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT log_change ON user THEN (CREATE log SET user = $value.id)
      `>;

      expectTypeOf<
        Schema['events']['log_change']['then']
      >().toEqualTypeOf<'(CREATE log SET user = $value.id)'>();
    });

    it('extracts event based on specific event type', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT publish_post ON publish_post WHEN $event = "CREATE" THEN (UPDATE post SET status = "PUBLISHED" WHERE id = $after.post_id)
      `>;

      expectTypeOf<Schema['events']['publish_post']['when']>().toEqualTypeOf<'$event = "CREATE"'>();
    });
  });

  describe('Modifiers', () => {
    it('extracts event with OVERWRITE', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT OVERWRITE test ON user THEN {}
      `>;

      expectTypeOf<Schema['events']['test']['overwrite']>().toEqualTypeOf<true>();
      expectTypeOf<Schema['events']['test']['ifNotExists']>().toEqualTypeOf<false>();
    });

    it('extracts event with IF NOT EXISTS', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT IF NOT EXISTS test ON user THEN {}
      `>;

      expectTypeOf<Schema['events']['test']['overwrite']>().toEqualTypeOf<false>();
      expectTypeOf<Schema['events']['test']['ifNotExists']>().toEqualTypeOf<true>();
    });
  });

  describe('Comments', () => {
    it('extracts event with COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT user_created ON user THEN {} COMMENT "Logs user creation"
      `>;

      expectTypeOf<
        Schema['events']['user_created']['comment']
      >().toEqualTypeOf<'Logs user creation'>();
    });
  });

  describe('Complex event definitions', () => {
    it('extracts event with WHEN, THEN and COMMENT', () => {
      type Schema = ParseSchema<`
        DEFINE EVENT OVERWRITE email_update ON TABLE user WHEN $event = "UPDATE" THEN (CREATE log) COMMENT "Email update logger"
      `>;

      type Event = Schema['events']['email_update'];
      expectTypeOf<Event['name']>().toEqualTypeOf<'email_update'>();
      expectTypeOf<Event['table']>().toEqualTypeOf<'user'>();
      expectTypeOf<Event['when']>().toEqualTypeOf<'$event = "UPDATE"'>();
      expectTypeOf<Event['then']>().toEqualTypeOf<'(CREATE log)'>();
      expectTypeOf<Event['comment']>().toEqualTypeOf<'Email update logger'>();
      expectTypeOf<Event['overwrite']>().toEqualTypeOf<true>();
    });
  });
});
