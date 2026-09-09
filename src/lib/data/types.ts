export type LocalizedName = {
  en?: string;
  "zh-CN"?: string;
};

export type EvidenceStatus = "confirmed" | "claimed" | "reported" | "estimated" | "unknown";

export type Entity = {
  id: string;
  type: string;
  slug?: string;
  names?: LocalizedName;
  aliases?: string[];
  status?: string;
  source_ids?: string[];
  event_ids?: string[];
  news_ids?: string[];
  evidence_status?: EvidenceStatus;
  [key: string]: unknown;
};

export type EntityRelations = {
  source_ids?: string[];
  event_ids?: string[];
  news_ids?: string[];
  vehicle_ids?: string[];
  brand_ids?: string[];
  manufacturer_ids?: string[];
  organization_ids?: string[];
  platform_ids?: string[];
  technology_ids?: string[];
  relationship_ids?: string[];
};

export type Brand = Entity & EntityRelations & { type: "brand" };
export type Manufacturer = Entity & EntityRelations & { type: "manufacturer" };
export type Organization = Entity & EntityRelations & { type: "organization" | "supplier" | "manufacturer" };
export type Technology = Entity & EntityRelations & { type: "technology" };
export type Platform = Entity & EntityRelations & { type: "platform" };

export type Timeline = {
  announcement_event_id?: string | null;
  preorder_event_id?: string | null;
  launch_event_id?: string | null;
  production_start_event_id?: string | null;
  delivery_start_event_id?: string | null;
  market_entry_event_ids?: string[];
};

export type Vehicle = Entity & {
  type: "vehicle";
  brand_id?: string;
  manufacturer_ids?: string[];
  platform_id?: string;
  technology_ids?: string[];
  market_spec_ids?: string[];
  media_ids?: string[];
  powertrain_types?: string[];
  timeline?: Timeline;
};

export type Event = {
  id: string;
  type: "event";
  event_type?: string;
  date?: string;
  date_precision?: string;
  subject_ids?: string[];
  related_document_ids?: string[];
  summary?: string;
  source_ids?: string[];
  evidence_status?: EvidenceStatus;
};

export type Source = {
  id: string;
  type: "source";
  publisher?: string;
  title?: string;
  url?: string;
  source_type?: string;
  source_level?: string;
  accessed_at?: string;
  supports?: string[];
  evidence_status?: EvidenceStatus;
};

export type Price = {
  amount?: number;
  currency?: string;
  price_type?: string;
};

export type Variant = {
  name?: string;
  prices?: Price[];
  powertrain_type?: string;
  battery_type?: string;
  range?: RangeValue;
  range_ev?: RangeValue;
  range_combined?: RangeValue;
  drive?: string;
  acceleration_0_100_s?: number;
  curb_weight_kg?: number;
  [key: string]: unknown;
};

export type RangeValue = {
  value_km?: number;
  standard?: string;
  unit?: string;
  evidence_status?: EvidenceStatus;
};

export type MarketSpecification = {
  id: string;
  type: "market_specification";
  vehicle_id: string;
  market?: string;
  status?: string;
  currency?: string;
  prices?: Price[];
  valid_from?: string | null;
  valid_to?: string | null;
  last_verified_at?: string;
  variants?: Variant[];
  source_ids?: string[];
  evidence_status?: EvidenceStatus;
  [key: string]: unknown;
};

export type NewsDocument = {
  id: string;
  type: "news";
  title: string;
  title_zh?: string;
  slug: string;
  status: string;
  published_at: string;
  updated_at?: string;
  author_ids?: string[];
  topic_ids?: string[];
  entity_ids?: string[];
  event_ids?: string[];
  source_ids?: string[];
  evidence_status?: EvidenceStatus;
  body: string;
};

export type NewsPageOptions = {
  page?: number;
  pageSize?: number;
};

export type NewsPage = {
  items: NewsDocument[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SearchType = "all" | "vehicle" | "brand" | "manufacturer" | "technology" | "news";

export type SearchOptions = {
  type?: SearchType;
  limit?: number;
};

export type SearchIndexEntry = {
  kind: "entity" | "news";
  id: string;
  type: SearchType;
  slug: string;
  display_name: string;
  display_name_zh?: string;
  aliases?: string[];
};

export type SearchResult = {
  id: string;
  type: string;
  slug: string;
  display_name: string;
  display_name_zh?: string;
  kind: "entity" | "news";
  href: string;
};

export type Author = {
  id: string;
  names?: LocalizedName;
  short_name?: string;
  role?: string;
};

export type Topic = {
  id: string;
  names?: LocalizedName;
};

export type Media = {
  id: string;
  type: "media";
  media_type?: string;
  usage?: string;
  entity_id?: string;
  asset_path?: string;
  alt?: LocalizedName;
  collection_status?: string;
  rights_status?: string;
};

export type DataIndex = {
  schema_version: number;
  entities: Entity[];
  market_specifications: MarketSpecification[];
  relationships: Entity[];
  events: Event[];
  sources: Source[];
  media: Media[];
};

export type ContentIndex = {
  schema_version: number;
  authors: Author[];
  topics: Topic[];
  documents: NewsDocument[];
};
