# Hubble - Data Product Catalog

## Project Overview
Advanced data product catalog designed to streamline data governance and contract management, inspired by OpenMetadata.

**Current State**: Fully functional data catalog with approval system, search functionality, and satellite-themed branding.

## Key Technologies
- React.js frontend with TypeScript
- Tailwind CSS for responsive design  
- PostgreSQL for data persistence
- Drizzle ORM for database operations
- TanStack Query for data fetching
- Wouter for routing

## Project Architecture

### Core Features
- **Portfolio Management**: Complete CRUD operations for data products
- **Approval System**: Full workflow for change management with create/approve/reject functionality
- **Search & Filtering**: Real-time search with type, domain, and status filters
- **Data Lineage**: Visual representation of data flow and transformations
- **Documentation Hub**: Centralized documentation management
- **History Tracking**: Complete audit trail of changes
- **Data Contracts**: Contract management and governance

### Database Schema
- `data_products`: Core product information with metadata
- `approval_requests`: Change management workflow system
- `product_changes`: Complete audit trail of all product modifications
- `user_favorites`: User favorite products tracking

### Recent Changes
- **2025-06-27**: Implemented complete changelog system with modification tracking
- **2025-06-27**: Added ProductChangelog component with visual change display and badges
- **2025-06-27**: Created changelog tab in product detail pages showing individual product history
- **2025-06-27**: Built Recent Changes modal overlay for full-screen change viewing
- **2025-06-27**: Added product_changes table with comprehensive change tracking schema
- **2025-06-27**: Implemented API routes for product-specific and recent changes endpoints
- **2025-06-27**: Generated realistic changelog data with timestamps and change descriptions
- **2025-06-27**: Implemented complete favorites system with PostgreSQL persistence
- **2025-06-27**: Added favorite buttons to product cards and detail pages with heart icons
- **2025-06-27**: Created dedicated favorites page with search functionality and empty states
- **2025-06-27**: Added favorites link to sidebar navigation for easy access
- **2025-06-27**: Optimized catalog layout with compact KPIs, advanced filters, and 4-column grid
- **2025-06-27**: Implemented visual markdown rendering for product documentation tabs
- **2025-01-27**: Added comprehensive fake data with all product types and rich documentation content

## User Preferences
- Language: Portuguese (Brazilian)
- Branding: Satellite-themed "Hubble" with consistent accent colors
- UI Style: Modern, clean interface with proper spacing and professional design

## Technical Notes
- Using DatabaseStorage with PostgreSQL for persistence
- All search and filter combinations work together properly
- Approval workflow supports product creation, editing, and status changes
- Real-time search filters results as user types