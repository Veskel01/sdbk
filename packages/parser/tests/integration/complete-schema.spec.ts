import { describe, expectTypeOf, it } from 'bun:test';
import type { ParseSchema, RecordId } from '../../src';

describe('Complete Database Schema', () => {
  it('extracts full database with all definition types', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER search_analyzer TOKENIZERS blank;

      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string;
      DEFINE FIELD name ON user TYPE string;
      DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;
      DEFINE EVENT user_created ON user;

      DEFINE TABLE post SCHEMAFULL;
      DEFINE FIELD id ON post TYPE string READONLY;
      DEFINE FIELD title ON post TYPE string;
      DEFINE FIELD author_id ON post TYPE string;
      DEFINE INDEX idx_post_author ON post FIELDS author_id;

      DEFINE FUNCTION fn::get_user_posts($user_id);

      DEFINE PARAM $app_name
    `>;

    // Tables
    expectTypeOf<Schema['tables']['user']['name']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['tables']['post']['name']>().toEqualTypeOf<'post'>();

    // Fields
    expectTypeOf<Schema['tables']['user']['fields']['email']['type']>().toEqualTypeOf<string>();
    expectTypeOf<Schema['tables']['post']['fields']['title']['type']>().toEqualTypeOf<string>();

    // Indexes
    expectTypeOf<Schema['indexes']['idx_user_email']['table']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['indexes']['idx_user_email']['unique']>().toEqualTypeOf<true>();
    expectTypeOf<Schema['indexes']['idx_post_author']['table']>().toEqualTypeOf<'post'>();

    // Events
    expectTypeOf<Schema['events']['user_created']['table']>().toEqualTypeOf<'user'>();

    // Analyzers
    expectTypeOf<
      Schema['analyzers']['search_analyzer']['name']
    >().toEqualTypeOf<'search_analyzer'>();

    // Functions
    expectTypeOf<
      Schema['functions']['fn::get_user_posts']['name']
    >().toEqualTypeOf<'fn::get_user_posts'>();

    // Params
    expectTypeOf<Schema['params']['app_name']['name']>().toEqualTypeOf<'app_name'>();
  });

  it('handles complex multi-table schema with relations', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string;
      DEFINE INDEX idx_email ON user FIELDS email UNIQUE;

      DEFINE TABLE post SCHEMAFULL;
      DEFINE FIELD id ON post TYPE string READONLY;
      DEFINE FIELD author ON post TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD title ON post TYPE string;
      DEFINE INDEX idx_author ON post FIELDS author;

      DEFINE TABLE comment SCHEMAFULL;
      DEFINE FIELD id ON comment TYPE string READONLY;
      DEFINE FIELD post ON comment TYPE record<post> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD author ON comment TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD content ON comment TYPE string;
    `>;

    // Verify all tables exist
    expectTypeOf<Schema['tables']['user']['name']>().toEqualTypeOf<'user'>();
    expectTypeOf<Schema['tables']['post']['name']>().toEqualTypeOf<'post'>();
    expectTypeOf<Schema['tables']['comment']['name']>().toEqualTypeOf<'comment'>();

    // Verify relations
    expectTypeOf<Schema['tables']['post']['fields']['author']['reference']>().toEqualTypeOf<{
      onDelete: 'CASCADE';
    }>();
    expectTypeOf<Schema['tables']['comment']['fields']['post']['reference']>().toEqualTypeOf<{
      onDelete: 'CASCADE';
    }>();
  });

  it('handles schema with all statement types', () => {
    type Schema = ParseSchema<`
      DEFINE ANALYZER search TOKENIZERS blank FILTERS lowercase;
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE INDEX idx_id ON user FIELDS id UNIQUE;
      DEFINE EVENT user_created ON user;
      DEFINE FUNCTION fn::test() { RETURN true; };
      DEFINE PARAM $api_key VALUE "secret";
      DEFINE USER admin ON ROOT PASSWORD "secret" ROLES OWNER;
      DEFINE SEQUENCE seq_id START 1;
      DEFINE ACCESS api ON DATABASE TYPE BEARER FOR USER;
      DEFINE BUCKET files BACKEND "memory";
      DEFINE CONFIG GRAPHQL TABLES AUTO;
      DEFINE MODULE mod::test AS f"test:/demo.surli";
    `>;

    // Verify all types are present
    expectTypeOf<Schema['analyzers']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['tables']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['indexes']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['events']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['functions']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['params']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['users']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['sequences']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['accesses']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['buckets']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['configs']>().toExtend<Record<string, any>>();
    expectTypeOf<Schema['modules']>().toExtend<Record<string, any>>();
  });

  it('handles complex e-commerce schema with full features', () => {
    type Schema = ParseSchema<`
      -- Analyzers for full-text search
      DEFINE ANALYZER product_search TOKENIZERS blank,class FILTERS lowercase,edgengram(2,10) COMMENT "Product search analyzer";
      DEFINE ANALYZER autocomplete TOKENIZERS blank FILTERS lowercase,edgengram(3,20);

      -- Users and authentication
      DEFINE TABLE user SCHEMAFULL;
      DEFINE FIELD id ON user TYPE string READONLY;
      DEFINE FIELD email ON user TYPE string VALUE string::lowercase($value) ASSERT string::is_email($value);
      DEFINE FIELD password ON user TYPE string PERMISSIONS NONE;
      DEFINE FIELD name ON user TYPE option<string>;
      DEFINE FIELD role ON user TYPE string DEFAULT "customer";
      DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now() READONLY;
      DEFINE FIELD updated_at ON user TYPE datetime VALUE time::now();
      DEFINE INDEX idx_user_email ON user FIELDS email UNIQUE;
      DEFINE INDEX idx_user_role ON user FIELDS role;
      DEFINE EVENT user_created ON user WHEN $event = "CREATE" THEN (CREATE log SET action = "user_created", user_id = $after.id);
      DEFINE EVENT user_updated ON user WHEN $before.email != $after.email THEN (CREATE log SET action = "email_changed");

      -- Products catalog
      DEFINE TABLE product SCHEMAFULL;
      DEFINE FIELD id ON product TYPE string READONLY;
      DEFINE FIELD name ON product TYPE string;
      DEFINE FIELD description ON product TYPE option<string>;
      DEFINE FIELD price ON product TYPE decimal ASSERT $value > 0;
      DEFINE FIELD stock ON product TYPE int DEFAULT 0 ASSERT $value >= 0;
      DEFINE FIELD category_id ON product TYPE record<category> REFERENCE ON DELETE REJECT;
      DEFINE FIELD tags ON product TYPE array<string> FLEXIBLE;
      DEFINE FIELD images ON product TYPE array<string>;
      DEFINE FIELD is_active ON product TYPE bool DEFAULT true;
      DEFINE FIELD metadata ON product TYPE object FLEXIBLE;
      DEFINE INDEX idx_product_name ON product FIELDS name SEARCH ANALYZER product_search;
      DEFINE INDEX idx_product_category ON product FIELDS category_id;
      DEFINE INDEX idx_product_price ON product FIELDS price;
      DEFINE INDEX idx_product_tags ON product FIELDS tags FULLTEXT ANALYZER autocomplete;
      DEFINE EVENT product_low_stock ON product WHEN $before.stock > 5 AND $after.stock <= 5 THEN (CREATE notification SET type = "low_stock", product_id = $after.id);

      -- Categories
      DEFINE TABLE category SCHEMAFULL;
      DEFINE FIELD id ON category TYPE string READONLY;
      DEFINE FIELD name ON category TYPE string;
      DEFINE FIELD slug ON category TYPE string VALUE string::slug($value);
      DEFINE FIELD parent_id ON category TYPE option<record<category>> REFERENCE ON DELETE CASCADE;
      DEFINE INDEX idx_category_slug ON category FIELDS slug UNIQUE;

      -- Orders
      DEFINE TABLE order SCHEMAFULL;
      DEFINE FIELD id ON order TYPE string READONLY;
      DEFINE FIELD user_id ON order TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD status ON order TYPE string DEFAULT "pending" ASSERT $value IN ["pending", "processing", "shipped", "delivered", "cancelled"];
      DEFINE FIELD total ON order TYPE decimal COMPUTED math::sum((SELECT VALUE price * quantity FROM order_item WHERE order_id = $parent.id));
      DEFINE FIELD shipping_address ON order TYPE object;
      DEFINE FIELD created_at ON order TYPE datetime DEFAULT time::now() READONLY;
      DEFINE INDEX idx_order_user ON order FIELDS user_id;
      DEFINE INDEX idx_order_status ON order FIELDS status;
      DEFINE INDEX idx_order_created ON order FIELDS created_at;
      DEFINE EVENT order_created ON order WHEN $event = "CREATE" THEN (UPDATE user SET last_order_at = time::now() WHERE id = $after.user_id);
      DEFINE EVENT order_status_changed ON order WHEN $before.status != $after.status THEN (CREATE notification SET type = "order_status", order_id = $after.id, status = $after.status);

      -- Order items
      DEFINE TABLE order_item SCHEMAFULL;
      DEFINE FIELD id ON order_item TYPE string READONLY;
      DEFINE FIELD order_id ON order_item TYPE record<order> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD product_id ON order_item TYPE record<product> REFERENCE ON DELETE REJECT;
      DEFINE FIELD quantity ON order_item TYPE int ASSERT $value > 0;
      DEFINE FIELD price ON order_item TYPE decimal ASSERT $value > 0;
      DEFINE INDEX idx_order_item_order ON order_item FIELDS order_id;
      DEFINE INDEX idx_order_item_product ON order_item FIELDS product_id;

      -- Reviews
      DEFINE TABLE review SCHEMAFULL;
      DEFINE FIELD id ON review TYPE string READONLY;
      DEFINE FIELD product_id ON review TYPE record<product> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD user_id ON review TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD rating ON review TYPE int ASSERT $value >= 1 AND $value <= 5;
      DEFINE FIELD comment ON review TYPE option<string>;
      DEFINE FIELD created_at ON review TYPE datetime DEFAULT time::now() READONLY;
      DEFINE INDEX idx_review_product ON review FIELDS product_id;
      DEFINE INDEX idx_review_user ON review FIELDS user_id;
      DEFINE INDEX idx_review_rating ON review FIELDS rating;

      -- Functions
      DEFINE FUNCTION fn::get_user_orders($user_id: record<user>) {
        RETURN SELECT * FROM order WHERE user_id = $user_id ORDER BY created_at DESC;
      } COMMENT "Get all orders for a user" PERMISSIONS WHERE $auth.id = $user_id;

      DEFINE FUNCTION fn::calculate_order_total($order_id: record<order>) {
        RETURN math::sum((SELECT VALUE price * quantity FROM order_item WHERE order_id = $order_id));
      } COMMENT "Calculate order total";

      DEFINE FUNCTION fn::search_products($query: string) {
        RETURN SELECT * FROM product WHERE name @@ $query AND is_active = true;
      } COMMENT "Search products" PERMISSIONS FULL;

      -- Parameters
      DEFINE PARAM $max_order_items VALUE 50 COMMENT "Maximum items per order";
      DEFINE PARAM $default_currency VALUE "USD" PERMISSIONS FULL;
      DEFINE PARAM $admin_email VALUE "admin@example.com" PERMISSIONS WHERE $auth.admin = true;

      -- Users and access
      DEFINE USER admin ON ROOT PASSWORD "secure_password" ROLES OWNER COMMENT "Administrator";
      DEFINE USER api_user ON DATABASE PASSWORD "api_secret" ROLES EDITOR DURATION FOR TOKEN 1h FOR SESSION 24h;

      DEFINE ACCESS api_bearer ON DATABASE TYPE BEARER FOR USER DURATION FOR GRANT 24h FOR TOKEN 1h FOR SESSION 7d AUTHENTICATE $token != NONE;
      DEFINE ACCESS jwt_auth ON DATABASE TYPE JWT ALGORITHM HS256 KEY "jwt_secret_key" DURATION FOR SESSION 24h;
      DEFINE ACCESS account ON DATABASE TYPE RECORD
        SIGNUP (CREATE user SET email = $email, password = crypto::argon2::generate($pass), role = "customer")
        SIGNIN (SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(password, $pass))
        WITH JWT ALGORITHM HS512 KEY "account_jwt_key"
        WITH REFRESH
        AUTHENTICATE $session.user != NONE
        DURATION FOR TOKEN 15m FOR SESSION 7d;

      -- Sequences
      DEFINE SEQUENCE order_number START 1000 BATCH 100 TIMEOUT 5s;
      DEFINE SEQUENCE product_sku START 10000 BATCH 50;

      -- Buckets
      DEFINE BUCKET product_images BACKEND "file:/storage/images" PERMISSIONS WHERE $auth.admin = true COMMENT "Product images storage";
      DEFINE BUCKET user_uploads BACKEND "memory" PERMISSIONS WHERE $auth.id = $user.id COMMENT "User uploads";

      -- Configurations
      DEFINE CONFIG GRAPHQL TABLES INCLUDE user, product, category, order FUNCTIONS INCLUDE [get_user_orders, search_products];
      DEFINE CONFIG API MIDDLEWARE api::timeout(30s), api::cors(), api::rate_limit(100) PERMISSIONS WHERE $auth.id != NONE;

      -- Modules
      DEFINE MODULE mod::utils AS f"utils:/helpers.surli";
      DEFINE MODULE mod::payments AS f"payments:/gateway.surli";
    `>;

    // Verify complex table structures
    type User = Schema['tables']['user'];
    expectTypeOf<User['fields']['email']['value']>().toEqualTypeOf<'string::lowercase($value)'>();
    expectTypeOf<User['fields']['email']['assert']>().toEqualTypeOf<'string::is_email($value)'>();
    expectTypeOf<User['fields']['password']['permissions']>().toExtend<{ none: true }>();
    expectTypeOf<User['fields']['role']['default']>().toEqualTypeOf<'"customer"'>();
    expectTypeOf<User['fields']['created_at']['readonly']>().toEqualTypeOf<true>();

    // Verify computed fields
    type Order = Schema['tables']['order'];
    expectTypeOf<Order['fields']['total']['computed']>().toExtend<string>();

    // Verify complex indexes
    expectTypeOf<Schema['indexes']['idx_product_name']['indexType']>().toEqualTypeOf<'search'>();
    expectTypeOf<Schema['indexes']['idx_product_tags']['indexType']>().toEqualTypeOf<'fulltext'>();

    // Verify events with conditions
    expectTypeOf<Schema['events']['user_created']['when']>().toEqualTypeOf<'$event = "CREATE"'>();
    expectTypeOf<Schema['events']['product_low_stock']['when']>().toExtend<string>();

    // Verify functions with permissions
    expectTypeOf<Schema['functions']['fn::get_user_orders']['permissions']>().toExtend<string>();
    expectTypeOf<
      Schema['functions']['fn::search_products']['permissions']
    >().toEqualTypeOf<'FULL'>();

    // Verify all access types
    expectTypeOf<Schema['accesses']['api_bearer']['accessType']>().toEqualTypeOf<'bearer'>();
    expectTypeOf<Schema['accesses']['jwt_auth']['accessType']>().toEqualTypeOf<'jwt'>();
    expectTypeOf<Schema['accesses']['account']['accessType']>().toEqualTypeOf<'record'>();
    expectTypeOf<Schema['accesses']['account']['withRefresh']>().toEqualTypeOf<true>();

    // Verify sequences
    expectTypeOf<Schema['sequences']['order_number']['start']>().toEqualTypeOf<1000>();
    expectTypeOf<Schema['sequences']['order_number']['batch']>().toEqualTypeOf<100>();

    // Verify buckets
    expectTypeOf<
      Schema['buckets']['product_images']['backend']
    >().toEqualTypeOf<'file:/storage/images'>();

    // Verify configs
    expectTypeOf<Schema['configs']['graphql']['tables']>().toExtend<string>();
    expectTypeOf<Schema['configs']['api']['middleware']>().toExtend<string[]>();
  });

  it('handles advanced schema with all field modifiers and complex relations', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE blog_post SCHEMAFULL;
      DEFINE FIELD id ON blog_post TYPE string READONLY;
      DEFINE FIELD OVERWRITE title ON blog_post TYPE string VALUE string::trim($value) ASSERT string::len($value) > 0 COMMENT "Post title";
      DEFINE FIELD IF NOT EXISTS slug ON blog_post TYPE string VALUE string::slug($value) READONLY COMMENT "URL slug";
      DEFINE FIELD content ON blog_post TYPE string;
      DEFINE FIELD author ON blog_post TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD published_at ON blog_post TYPE option<datetime>;
      DEFINE FIELD views ON blog_post TYPE int DEFAULT 0 DEFAULT ALWAYS 0;
      DEFINE FIELD tags ON blog_post TYPE array<string> FLEXIBLE;
      DEFINE FIELD metadata ON blog_post TYPE object FLEXIBLE PERMISSIONS NONE;
      DEFINE FIELD excerpt ON blog_post COMPUTED string::slice(content, 0, 200) TYPE string COMMENT "Auto-generated excerpt";
      DEFINE INDEX idx_post_slug ON blog_post FIELDS slug UNIQUE;
      DEFINE INDEX idx_post_author ON blog_post FIELDS author;
      DEFINE INDEX idx_post_published ON blog_post FIELDS published_at;
      DEFINE INDEX idx_post_content ON blog_post FIELDS content FULLTEXT ANALYZER product_search;

      DEFINE TABLE tag SCHEMAFULL;
      DEFINE FIELD id ON tag TYPE string READONLY;
      DEFINE FIELD name ON tag TYPE string VALUE string::lowercase($value);
      DEFINE FIELD slug ON tag TYPE string VALUE string::slug($value);
      DEFINE INDEX idx_tag_slug ON tag FIELDS slug UNIQUE;

      DEFINE TABLE post_tag SCHEMAFULL TYPE RELATION FROM blog_post TO tag;
      DEFINE FIELD in ON post_tag TYPE record<blog_post> READONLY;
      DEFINE FIELD out ON post_tag TYPE record<tag> READONLY;

      DEFINE TABLE comment SCHEMAFULL;
      DEFINE FIELD id ON comment TYPE string READONLY;
      DEFINE FIELD post_id ON comment TYPE record<blog_post> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD parent_id ON comment TYPE option<record<comment>> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD author ON comment TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD content ON comment TYPE string ASSERT string::len($value) > 0 AND string::len($value) <= 5000;
      DEFINE FIELD is_approved ON comment TYPE bool DEFAULT false;
      DEFINE FIELD created_at ON comment TYPE datetime DEFAULT time::now() READONLY;
      DEFINE INDEX idx_comment_post ON comment FIELDS post_id;
      DEFINE INDEX idx_comment_parent ON comment FIELDS parent_id;
      DEFINE INDEX idx_comment_author ON comment FIELDS author;

      DEFINE FUNCTION fn::get_post_comments($post_id: record<blog_post>) {
        RETURN SELECT * FROM comment WHERE post_id = $post_id AND is_approved = true ORDER BY created_at ASC;
      } COMMENT "Get approved comments for a post" PERMISSIONS FULL;

      DEFINE FUNCTION fn::approve_comment($comment_id: record<comment>) {
        RETURN UPDATE comment SET is_approved = true WHERE id = $comment_id;
      } COMMENT "Approve a comment" PERMISSIONS WHERE $auth.admin = true;
    `>;

    // Verify field modifiers
    type BlogPost = Schema['tables']['blog_post'];
    expectTypeOf<BlogPost['fields']['title']['overwrite']>().toEqualTypeOf<true>();
    expectTypeOf<BlogPost['fields']['title']['value']>().toEqualTypeOf<'string::trim($value)'>();
    expectTypeOf<BlogPost['fields']['slug']['ifNotExists']>().toEqualTypeOf<true>();
    expectTypeOf<BlogPost['fields']['slug']['readonly']>().toEqualTypeOf<true>();
    expectTypeOf<BlogPost['fields']['views']['defaultAlways']>().toEqualTypeOf<true>();
    expectTypeOf<BlogPost['fields']['metadata']['flexible']>().toEqualTypeOf<true>();
    expectTypeOf<BlogPost['fields']['excerpt']['computed']>().toExtend<string>();

    // Verify relation table
    type PostTag = Schema['tables']['post_tag'];
    expectTypeOf<PostTag['tableType']>().toEqualTypeOf<'relation'>();

    // Verify nested references
    type Comment = Schema['tables']['comment'];
    // parent_id is option<record<comment>> which maps to RecordId | null
    expectTypeOf<Comment['fields']['parent_id']['type']>().toExtend<RecordId<'comment'> | null>();
    expectTypeOf<Comment['fields']['content']['assert']>().toExtend<string>();
  });

  it('handles schema with complex permissions and security features', () => {
    type Schema = ParseSchema<`
      DEFINE TABLE document SCHEMAFULL;
      DEFINE FIELD id ON document TYPE string READONLY;
      DEFINE FIELD title ON document TYPE string PERMISSIONS FOR select WHERE published = true OR author = $auth.id FOR update WHERE author = $auth.id FOR delete WHERE author = $auth.id OR $auth.admin = true;
      DEFINE FIELD content ON document TYPE string PERMISSIONS FOR select WHERE published = true OR author = $auth.id FOR update WHERE author = $auth.id;
      DEFINE FIELD author ON document TYPE record<user> REFERENCE ON DELETE CASCADE;
      DEFINE FIELD published ON document TYPE bool DEFAULT false PERMISSIONS FOR update WHERE $auth.admin = true;
      DEFINE FIELD created_at ON document TYPE datetime DEFAULT time::now() READONLY;
      DEFINE INDEX idx_document_author ON document FIELDS author;
      DEFINE INDEX idx_document_published ON document FIELDS published;

      DEFINE TABLE audit_log SCHEMAFULL PERMISSIONS NONE;
      DEFINE FIELD id ON audit_log TYPE string READONLY;
      DEFINE FIELD action ON audit_log TYPE string;
      DEFINE FIELD user_id ON audit_log TYPE option<record<user>>;
      DEFINE FIELD details ON audit_log TYPE object;
      DEFINE FIELD created_at ON audit_log TYPE datetime DEFAULT time::now() READONLY;
      DEFINE INDEX idx_audit_user ON audit_log FIELDS user_id;
      DEFINE INDEX idx_audit_created ON audit_log FIELDS created_at;

      DEFINE FUNCTION fn::create_document($title: string, $content: string) {
        RETURN CREATE document SET title = $title, content = $content, author = $auth.id, published = false;
      } COMMENT "Create a new document" PERMISSIONS WHERE $auth.id != NONE;

      DEFINE FUNCTION fn::publish_document($doc_id: record<document>) {
        RETURN UPDATE document SET published = true WHERE id = $doc_id AND author = $auth.id;
      } COMMENT "Publish own document" PERMISSIONS WHERE $auth.id != NONE;

      DEFINE FUNCTION fn::admin_delete_document($doc_id: record<document>) {
        RETURN DELETE document WHERE id = $doc_id;
      } COMMENT "Admin delete document" PERMISSIONS WHERE $auth.admin = true;

      DEFINE PARAM $max_document_size VALUE 10485760 COMMENT "Max document size in bytes" PERMISSIONS WHERE $auth.admin = true;
      DEFINE PARAM $enable_audit_logging VALUE true PERMISSIONS NONE;

      DEFINE ACCESS admin_api ON ROOT TYPE JWT ALGORITHM RS256 KEY "admin_public_key" URL "https://auth.example.com/.well-known/jwks.json" DURATION FOR SESSION 1h;
    `>;

    // Verify complex permissions
    type Document = Schema['tables']['document'];
    expectTypeOf<Document['fields']['title']['permissions']>().toExtend<{
      full: false;
      none: false;
    }>();
    // Table permissions may be undefined if not specified
    expectTypeOf<Document['permissions']>().toExtend<Record<string, any> | undefined>();

    // Verify table with PERMISSIONS NONE
    type AuditLog = Schema['tables']['audit_log'];
    expectTypeOf<AuditLog['permissions']>().toExtend<{
      none: true;
      full: false;
    }>();

    // Verify function permissions
    expectTypeOf<Schema['functions']['fn::create_document']['permissions']>().toExtend<string>();
    expectTypeOf<
      Schema['functions']['fn::admin_delete_document']['permissions']
    >().toExtend<string>();

    // Verify param permissions
    expectTypeOf<Schema['params']['max_document_size']['permissions']>().toExtend<string>();
    expectTypeOf<Schema['params']['enable_audit_logging']['permissions']>().toEqualTypeOf<'none'>();

    // Verify JWT access with URL
    type AdminApi = Schema['accesses']['admin_api'];
    expectTypeOf<AdminApi['accessType']>().toEqualTypeOf<'jwt'>();
    expectTypeOf<AdminApi['jwt']>().toExtend<{
      algorithm?: string;
      key?: string;
      url?: string;
    }>();
  });
});
