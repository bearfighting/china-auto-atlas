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
export type Factory = Entity & {
  type: "factory";
  operator_ids?: string[];
  owner_ids?: string[];
  location?: Record<string, unknown>;
  opened_at?: Record<string, unknown> | string | null;
};
export type ReportedCapacity = {
  value?: number;
  unit?: string;
  valid_from?: string | null;
  valid_to?: string | null;
  date_precision?: string;
  evidence_status?: EvidenceStatus;
  source_ids?: string[];
};
export type ProductionLine = Entity & {
  type: "production_line";
  factory_id: string;
  opened_at?: Record<string, unknown> | string | null;
  closed_at?: Record<string, unknown> | string | null;
  vehicle_ids?: string[];
  technology_ids?: string[];
  reported_capacity?: ReportedCapacity;
};
export type ProductLine = Entity & {
  type: "product_line";
  brand_id: string;
};
export type VehicleSeries = Entity & {
  type: "vehicle_series";
  brand_id: string;
  product_line_id?: string;
};
export type TechnologyKind = "generic" | "branded" | "system" | "component" | "process";
export type Technology = Entity &
  EntityRelations & {
    type: "technology";
    kind: TechnologyKind;
    domain_ids: string[];
    category_ids: string[];
    family_ids?: string[];
  };
export type Platform = Entity & EntityRelations & { type: "platform" };

export type TaxonomyRecord = {
  id: string;
  type: string;
  names: LocalizedName;
  description?: LocalizedName;
};

export type TechnologyDomain = TaxonomyRecord & { type: "technology_domain" };
export type TechnologyCategory = TaxonomyRecord & {
  type: "technology_category";
  domain_id: string;
  parent_id?: string | null;
};
export type TechnologyFamily = TaxonomyRecord & { type: "technology_family" };
export type PowertrainArchitecture = TaxonomyRecord & { type: "powertrain_architecture" };

export type RelationshipType =
  | "uses"
  | "integrates"
  | "based_on"
  | "evolves_from"
  | "replaces"
  | "enables"
  | "complements"
  | "related_to"
  | "operates"
  | "parent_of"
  | "controls"
  | "strategic_partner_of"
  | "developed_by"
  | "developed_for"
  | "jointly_developed_by"
  | "owns"
  | "invested_in";

export type Relationship = {
  id: string;
  type: "relationship";
  from_id: string;
  to_id: string;
  relationship: RelationshipType;
  source_ids: string[];
  evidence_status: EvidenceStatus;
  [key: string]: unknown;
};

export type MotorPosition = "p0" | "p1" | "p2" | "p3" | "p4" | "e-axle" | "unknown";
export type PowertrainType = "bev" | "phev" | "erev";

export type VehiclePageOptions = {
  page?: number;
  pageSize?: number;
  brandId?: string;
  powertrainType?: PowertrainType;
  status?: string;
};

export type VehicleFilterOptions = {
  brands: Brand[];
  powertrainTypes: PowertrainType[];
  statuses: string[];
};

export type VehiclePage = {
  items: Vehicle[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type BrandPageOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type BrandPage = {
  items: Brand[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ManufacturerSummary = {
  brandCount: number;
  vehicleCount: number;
  newsCount: number;
  sourceCount: number;
};

export type TechnologyPageOptions = {
  page?: number;
  pageSize?: number;
  query?: string;
  domainId?: string;
  categoryId?: string;
  familyId?: string;
};

export type TechnologyFilterOptions = {
  domains: TechnologyDomain[];
  categories: TechnologyCategory[];
  families: TechnologyFamily[];
};

export type TechnologyPage = {
  items: Technology[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

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
  product_line_id?: string;
  series_id?: string;
  manufacturer_ids?: string[];
  platform_id?: string;
  technology_ids?: string[];
  market_spec_ids?: string[];
  media_ids?: string[];
  powertrain_types?: PowertrainType[];
  powertrain_architecture_id?: string | null;
  motor_positions?: MotorPosition[];
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
  year?: number;
  entityId?: string;
};

export type NewsFilterOptions = {
  years: number[];
  entities: Entity[];
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
  technology_domains: TechnologyDomain[];
  technology_categories: TechnologyCategory[];
  technology_families: TechnologyFamily[];
  powertrain_architectures: PowertrainArchitecture[];
  market_specifications: MarketSpecification[];
  relationships: Relationship[];
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
