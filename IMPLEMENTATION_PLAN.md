# Implementation Plan: AI Startup Ecosystem Graph

## Project Overview

This document outlines the phased implementation plan for building a lightweight web application that visualizes relationships between AI startups and their cofounders as an interactive graph network.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Graph Visualization**: React Flow (recommended for React integration)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **LLM Integration**: OpenAI SDK (configurable for other providers)
- **Data Storage**: JSON file (seed data) + optional in-memory cache
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **DevOps**: Docker support

### Project Structure
```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── graph/         # GET /api/graph
│   │   └── ai/            # POST /api/ai/summary
│   ├── page.tsx           # Main graph view
│   └── layout.tsx
├── components/            # React components
│   ├── GraphCanvas/
│   ├── SearchBar/
│   ├── FilterPanel/
│   └── DetailPanel/
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript definitions
│   ├── data.ts           # Data loading and parsing
│   ├── graph-utils.ts    # Graph computation helpers
│   └── ai-client.ts      # LLM integration
├── data/                  # Seed data
│   └── seed.json
├── __tests__/            # Test files
├── tests/                # E2E tests
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Phase 1: Project Setup & Foundation (Week 1)

### Goals
- Initialize Next.js project with TypeScript
- Set up development environment and tooling
- Create core type definitions
- Establish testing infrastructure

### Tasks

#### 1.1 Project Initialization
- [ ] Initialize Next.js 14+ project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up ESLint and Prettier
- [ ] Configure path aliases (`@/components`, `@/lib`, etc.)
- [ ] Set up environment variables template (.env.example)

#### 1.2 Type Definitions
- [ ] Define core types in `lib/types.ts`:
  - `Startup`, `Person`, `Edge`, `NodeType`, `EdgeType`
  - Graph data structures
  - API request/response types
- [ ] Create TypeScript strict mode configuration

#### 1.3 Testing Infrastructure
- [ ] Install and configure Jest
- [ ] Install React Testing Library
- [ ] Install Playwright for E2E tests
- [ ] Set up test utilities and helpers
- [ ] Configure test coverage reporting

#### 1.4 Development Tools
- [ ] Set up Docker and docker-compose
- [ ] Create basic Dockerfile
- [ ] Configure hot reload and development scripts
- [ ] Set up Git hooks (optional: Husky)

### Deliverables
- ✅ Project skeleton with all dependencies
- ✅ TypeScript configuration with strict mode
- ✅ Basic test setup with sample test
- ✅ Docker configuration

### Tests
- Unit test: Type definitions validation
- Unit test: Test setup verification
- Integration test: Next.js dev server starts

### Success Criteria
- `npm run dev` starts without errors
- `npm run test` runs successfully
- Docker builds without errors

---

## Phase 2: Data Layer & API Foundation (Week 1-2)

### Goals
- Create seed data structure
- Implement data loading and parsing
- Build core API endpoints
- Add data validation

### Tasks

#### 2.1 Seed Data Creation
- [ ] Design JSON schema for seed data
- [ ] Create realistic seed dataset (20-30 startups, 30-50 people)
- [ ] Validate data structure against types
- [ ] Document data format

#### 2.2 Data Loading & Parsing
- [ ] Implement `lib/data.ts` with functions:
  - `loadSeedData()` - Load JSON file
  - `parseGraphData()` - Transform to graph format
  - `validateData()` - Runtime validation
- [ ] Add error handling for malformed data
- [ ] Create data transformation utilities

#### 2.3 Graph Data API
- [ ] Implement `GET /api/graph` endpoint
- [ ] Return nodes and edges in React Flow format
- [ ] Add basic error handling
- [ ] Implement response caching (optional)

#### 2.4 Graph Utilities
- [ ] Create `lib/graph-utils.ts`:
  - `buildGraph(nodes, edges)` - Construct graph structure
  - `findNodeById(id)` - Node lookup
  - `getNeighbors(nodeId)` - Get connected nodes
  - `filterGraph(criteria)` - Graph filtering logic

### Deliverables
- ✅ Seed data JSON file
- ✅ Data loading and parsing utilities
- ✅ Working `/api/graph` endpoint
- ✅ Graph utility functions

### Tests
- Unit tests: Data loading and parsing
- Unit tests: Data validation (valid/invalid inputs)
- Unit tests: Graph utility functions
- Integration tests: API endpoint returns correct structure
- Integration tests: API handles edge cases (empty data, malformed data)

### Success Criteria
- API returns valid graph data structure
- All data validation passes
- Graph utilities handle edge cases correctly
- API response time < 100ms

---

## Phase 3: Graph Visualization Core (Week 2)

### Goals
- Set up React Flow
- Render basic graph with nodes and edges
- Implement force-directed layout
- Add basic interactions (pan, zoom, drag)

### Tasks

#### 3.1 React Flow Setup
- [ ] Install React Flow
- [ ] Create `GraphCanvas` component
- [ ] Set up React Flow provider
- [ ] Configure default viewport settings

#### 3.2 Node Rendering
- [ ] Create custom node components:
  - `StartupNode` (different color/shape)
  - `PersonNode` (different color/shape)
- [ ] Implement node positioning from data
- [ ] Add node labels
- [ ] Style nodes with Tailwind

#### 3.3 Edge Rendering
- [ ] Configure edge styles (colors, arrows)
- [ ] Handle different edge types if applicable
- [ ] Add edge labels for "co-founded" relationships

#### 3.4 Layout Implementation
- [ ] Configure force-directed layout
- [ ] Set initial node positions
- [ ] Handle layout on data changes
- [ ] Ensure layout stability

#### 3.5 Basic Interactions
- [ ] Enable pan and zoom
- [ ] Enable node dragging
- [ ] Add hover effects (show labels)
- [ ] Implement smooth transitions

### Deliverables
- ✅ Functional graph visualization
- ✅ Custom node components
- ✅ Force-directed layout
- ✅ Basic interactions working

### Tests
- Unit tests: Node component rendering
- Unit tests: Edge component rendering
- Integration tests: Graph renders with data
- Visual regression tests: Graph layout consistency
- E2E tests: Pan, zoom, drag interactions

### Success Criteria
- Graph renders within 5 seconds on load
- All nodes and edges visible
- Smooth interactions (60fps)
- No layout flickering

---

## Phase 4: Search & Filtering (Week 2-3)

### Goals
- Implement search functionality
- Add filtering options
- Update graph dynamically based on filters
- Optimize performance

### Tasks

#### 4.1 Search Implementation
- [ ] Create `SearchBar` component
- [ ] Implement search logic (partial string matching)
- [ ] Add debouncing for search input
- [ ] Highlight matching nodes
- [ ] Focus view on search results

#### 4.2 Filter Panel
- [ ] Create `FilterPanel` component
- [ ] Implement domain tag filtering (multi-select)
- [ ] Implement company stage filtering
- [ ] Add filter state management
- [ ] Create filter UI (checkboxes/dropdowns)

#### 4.3 Graph Filtering Logic
- [ ] Extend `lib/graph-utils.ts`:
  - `applyFilters(nodes, edges, filters)` - Filter nodes
  - `applySearch(nodes, searchTerm)` - Search nodes
  - `combineFilters()` - Combine multiple filters
- [ ] Update graph on filter changes
- [ ] Maintain edge connections for visible nodes

#### 4.4 Performance Optimization
- [ ] Implement memoization for filtered data
- [ ] Optimize re-renders (React.memo)
- [ ] Add loading states during filtering
- [ ] Handle large datasets efficiently

### Deliverables
- ✅ Search bar with real-time filtering
- ✅ Filter panel with multiple options
- ✅ Dynamic graph updates
- ✅ Optimized performance

### Tests
- Unit tests: Search logic (exact match, partial match, case insensitive)
- Unit tests: Filter logic (single filter, multiple filters)
- Unit tests: Filter combinations
- Integration tests: Search updates graph
- Integration tests: Filters update graph
- E2E tests: Full search and filter workflow

### Success Criteria
- Search results appear instantly (< 100ms)
- Filters update graph smoothly
- No performance degradation with filters
- Search is case-insensitive and partial match

---

## Phase 5: Detail Panel & Node Interactions (Week 3)

### Goals
- Implement node click handling
- Create detail panel component
- Display node metadata
- Show connected nodes

### Tasks

#### 5.1 Node Click Handling
- [ ] Add click handlers to nodes
- [ ] Track selected node state
- [ ] Highlight selected node
- [ ] Scroll/pan to selected node if needed

#### 5.2 Detail Panel Component
- [ ] Create `DetailPanel` component
- [ ] Design panel layout (right sidebar)
- [ ] Implement open/close animations
- [ ] Make panel responsive

#### 5.3 Node Details Display
- [ ] Display Startup fields:
  - Name, Domain tags, Stage, Founded year, Location, Description
- [ ] Display Person fields:
  - Name, Roles, Keywords, Bio
- [ ] Style fields appropriately
- [ ] Handle missing/optional fields

#### 5.4 Connected Nodes List
- [ ] Implement `getConnectedNodes(nodeId)` logic
- [ ] Display connected nodes list
- [ ] Make connected nodes clickable
- [ ] Add navigation (click to select)
- [ ] Show connection type and metadata

#### 5.5 Panel State Management
- [ ] Handle panel state (open/closed)
- [ ] Clear selection on outside click
- [ ] Update panel on node selection change
- [ ] Handle edge cases (no connections, etc.)

### Deliverables
- ✅ Working detail panel
- ✅ Complete node information display
- ✅ Connected nodes navigation
- ✅ Smooth interactions

### Tests
- Unit tests: Detail panel component rendering
- Unit tests: Connected nodes calculation
- Integration tests: Click node opens panel
- Integration tests: Panel displays correct data
- Integration tests: Connected nodes navigation
- E2E tests: Full node selection and navigation flow

### Success Criteria
- Panel opens smoothly on node click
- All node data displays correctly
- Connected nodes are clickable
- Panel closes appropriately

---

## Phase 6: AI Integration (Week 3-4)

### Goals
- Integrate LLM API
- Implement AI summary endpoint
- Add AI action button to detail panel
- Implement caching

### Tasks

#### 6.1 LLM Client Setup
- [ ] Create `lib/ai-client.ts`
- [ ] Install OpenAI SDK (or configurable provider)
- [ ] Set up API key from environment variables
- [ ] Create client wrapper with error handling

#### 6.2 Prompt Engineering
- [ ] Design system prompts for clarity and brevity
- [ ] Create user prompt templates:
  - Startup summary template
  - Person summary template
- [ ] Include node metadata in prompts
- [ ] Include neighbor information
- [ ] Set token limits and temperature

#### 6.3 AI Summary API
- [ ] Implement `POST /api/ai/summary` endpoint
- [ ] Validate request (nodeId, mode)
- [ ] Fetch node data and neighbors
- [ ] Construct prompt
- [ ] Call LLM API
- [ ] Return concise response
- [ ] Add error handling and timeouts

#### 6.4 Caching Implementation
- [ ] Implement in-memory cache (Map-based)
- [ ] Cache key: `nodeId-mode`
- [ ] Set cache expiration (optional)
- [ ] Return cached responses when available

#### 6.5 UI Integration
- [ ] Add "Generate Summary" button to DetailPanel
- [ ] Implement loading state
- [ ] Display AI response in panel
- [ ] Handle errors gracefully
- [ ] Show token usage or cost (optional)

### Deliverables
- ✅ AI summary endpoint
- ✅ Working AI integration in UI
- [ ] Caching implementation
- ✅ Error handling

### Tests
- Unit tests: Prompt construction
- Unit tests: Cache hit/miss logic
- Integration tests: AI endpoint with mock LLM
- Integration tests: Caching behavior
- Integration tests: Error handling
- E2E tests: Full AI workflow (may require API key)

### Success Criteria
- AI summary returns within 3-5 seconds
- Responses are concise and relevant
- Caching works correctly
- Errors handled gracefully
- Cost-effective (token limits enforced)

---

## Phase 7: UI/UX Polish & Optimization (Week 4)

### Goals
- Polish user interface
- Improve user experience
- Optimize performance
- Add visual enhancements

### Tasks

#### 7.1 Visual Design
- [ ] Refine color scheme and typography
- [ ] Ensure clear node type distinction
- [ ] Improve spacing and layout
- [ ] Add subtle animations
- [ ] Create consistent design system

#### 7.2 Responsive Design
- [ ] Make layout responsive
- [ ] Handle mobile/tablet views
- [ ] Adjust panel for smaller screens
- [ ] Optimize graph for different screen sizes

#### 7.3 Performance Optimization
- [ ] Profile and optimize render performance
- [ ] Reduce unnecessary re-renders
- [ ] Optimize large graph rendering
- [ ] Add virtual scrolling if needed
- [ ] Implement lazy loading

#### 7.4 User Experience Enhancements
- [ ] Add loading states throughout
- [ ] Improve error messages
- [ ] Add tooltips for unclear elements
- [ ] Implement keyboard shortcuts (optional)
- [ ] Add visual feedback for all actions

#### 7.5 Accessibility
- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Ensure color contrast compliance
- [ ] Add focus indicators

### Deliverables
- ✅ Polished UI
- ✅ Responsive design
- ✅ Optimized performance
- ✅ Improved accessibility

### Tests
- Visual regression tests: UI consistency
- Performance tests: Load time, render time
- Accessibility tests: WCAG compliance
- E2E tests: Cross-browser compatibility

### Success Criteria
- Graph renders in < 5 seconds
- Smooth 60fps interactions
- Responsive on all screen sizes
- Accessible to screen readers
- No performance regressions

---

## Phase 8: Docker & Deployment Prep (Week 4)

### Goals
- Complete Docker setup
- Create deployment documentation
- Finalize environment configuration
- Prepare for easy local setup

### Tasks

#### 8.1 Docker Configuration
- [ ] Finalize Dockerfile
- [ ] Optimize Docker image size
- [ ] Create docker-compose.yml
- [ ] Add health checks
- [ ] Configure environment variables

#### 8.2 Documentation
- [ ] Write comprehensive README.md
- [ ] Document environment variables
- [ ] Add setup instructions
- [ ] Create API documentation
- [ ] Add troubleshooting guide

#### 8.3 Environment Configuration
- [ ] Create .env.example with all variables
- [ ] Document required vs optional variables
- [ ] Add validation for required variables
- [ ] Create startup script if needed

#### 8.4 Build & Run Scripts
- [ ] Optimize build process
- [ ] Create convenient npm scripts
- [ ] Add development scripts
- [ ] Test Docker build process

### Deliverables
- ✅ Working Docker setup
- ✅ Complete documentation
- ✅ Easy local setup process

### Tests
- Integration tests: Docker build succeeds
- Integration tests: Docker container runs
- Integration tests: All endpoints work in Docker
- E2E tests: Full app works in Docker

### Success Criteria
- `docker-compose up` runs successfully
- App accessible on localhost
- All features work in Docker
- One-command setup works

---

## Phase 9: Testing & Quality Assurance (Throughout)

### Goals
- Comprehensive test coverage
- Bug fixes and refinements
- Performance validation
- Reliability improvements

### Tasks

#### 9.1 Unit Testing
- [ ] Achieve >80% code coverage
- [ ] Test all utility functions
- [ ] Test all components
- [ ] Test edge cases
- [ ] Test error handling

#### 9.2 Integration Testing
- [ ] Test API endpoints
- [ ] Test data flow
- [ ] Test component integration
- [ ] Test error scenarios

#### 9.3 End-to-End Testing
- [ ] Test critical user flows
- [ ] Test graph interactions
- [ ] Test search and filtering
- [ ] Test AI feature
- [ ] Cross-browser testing

#### 9.4 Performance Testing
- [ ] Load time benchmarks
- [ ] Render performance
- [ ] Filter/search performance
- [ ] Memory usage profiling
- [ ] Large dataset handling

#### 9.5 Bug Fixes
- [ ] Fix all critical bugs
- [ ] Fix all high-priority bugs
- [ ] Address user experience issues
- [ ] Fix accessibility issues

### Deliverables
- ✅ Comprehensive test suite
- ✅ >80% code coverage
- ✅ All critical bugs fixed
- ✅ Performance benchmarks met

### Tests
- Full test suite execution
- Performance benchmarks
- Browser compatibility tests
- Accessibility audit

### Success Criteria
- All tests passing
- >80% code coverage
- Performance metrics met
- No critical bugs
- Reliable and robust application

---

## Testing Strategy

### Unit Tests
- **Scope**: Individual functions, utilities, components
- **Framework**: Jest + React Testing Library
- **Coverage Target**: >80%
- **Key Areas**:
  - Data parsing and validation
  - Graph utilities
  - Filter/search logic
  - AI client functions
  - Component rendering

### Integration Tests
- **Scope**: API endpoints, data flow, component integration
- **Framework**: Jest + Next.js testing utilities
- **Key Areas**:
  - API request/response handling
  - Data transformation pipeline
  - Graph state management
  - Filter application flow

### End-to-End Tests
- **Scope**: Complete user workflows
- **Framework**: Playwright
- **Key Scenarios**:
  - Load graph and verify rendering
  - Search for node and verify highlighting
  - Apply filters and verify graph update
  - Click node and verify detail panel
  - Generate AI summary and verify display
  - Navigate connected nodes

### Performance Tests
- **Scope**: Load time, render performance, responsiveness
- **Metrics**:
  - Initial graph load < 5 seconds
  - Search response < 100ms
  - Filter update < 200ms
  - AI response < 5 seconds
  - 60fps interactions

### Accessibility Tests
- **Scope**: WCAG 2.1 AA compliance
- **Tools**: axe-core, manual testing
- **Key Areas**:
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast
  - ARIA labels

---

## Scope Definition

### In Scope ✅

#### Core Features
- Interactive graph visualization with React Flow
- Search functionality with partial matching
- Filtering by domain tags and company stage
- Detail panel with node information
- Connected nodes navigation
- AI-powered summary generation
- Force-directed layout

#### Technical Requirements
- Next.js with TypeScript
- Tailwind CSS styling
- JSON seed data
- API routes for data and AI
- Docker support
- Environment variable configuration
- Error handling
- Loading states

#### Quality Requirements
- Comprehensive testing (>80% coverage)
- Performance optimization
- Responsive design
- Accessibility compliance
- Clean code architecture

### Out of Scope ❌

#### Features
- Real-time data scraping
- External API integrations (except LLM)
- User authentication
- User accounts/profiles
- Dataset uploads
- Graph data export
- URL state persistence
- Graph legend and minimap
- Multiple relationship types beyond co-founded
- Production-grade analytics
- Production deployment infrastructure

#### Technical
- Database persistence (SQLite mentioned as optional)
- Real-time updates
- WebSocket connections
- Complex state management (Redux/Zustand)
- Server-side rendering (SSR) for graph
- Service workers/PWA features

---

## Risk Assessment & Mitigation

### Technical Risks

#### 1. Graph Performance with Large Datasets
- **Risk**: Slow rendering with 100+ nodes
- **Mitigation**: 
  - Virtualization for large graphs
  - Debouncing for filter updates
  - Memoization of computed values
  - Performance testing with varying dataset sizes

#### 2. LLM API Costs
- **Risk**: Unexpected costs from API calls
- **Mitigation**:
  - Strict token limits
  - Caching implementation
  - Request rate limiting
  - Clear documentation of costs

#### 3. React Flow Integration Complexity
- **Risk**: Complex integration with Next.js
- **Mitigation**:
  - Thorough documentation review
  - Early prototyping
  - Fallback to simpler library if needed

### Quality Risks

#### 1. Test Coverage Gaps
- **Risk**: Missing edge cases in tests
- **Mitigation**:
  - Code review process
  - Coverage reports
  - E2E test coverage
  - Regular test maintenance

#### 2. Browser Compatibility
- **Risk**: Issues on different browsers
- **Mitigation**:
  - Cross-browser testing
  - Polyfills if needed
  - Progressive enhancement

---

## Success Metrics

### Performance Metrics
- ✅ Graph renders in < 5 seconds
- ✅ Search responds in < 100ms
- ✅ Filter updates in < 200ms
- ✅ AI summary returns in < 5 seconds
- ✅ 60fps interactions

### Quality Metrics
- ✅ >80% test coverage
- ✅ All critical bugs fixed
- ✅ WCAG 2.1 AA compliance
- ✅ Zero console errors
- ✅ Lighthouse score > 90

### Reliability Metrics
- ✅ Handles edge cases gracefully
- ✅ Error messages are user-friendly
- ✅ No memory leaks
- ✅ Stable under normal usage
- ✅ Docker setup works consistently

---

## Timeline Estimate

- **Phase 1**: 1-2 days
- **Phase 2**: 2-3 days
- **Phase 3**: 2-3 days
- **Phase 4**: 2-3 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2-3 days
- **Phase 7**: 2-3 days
- **Phase 8**: 1-2 days
- **Phase 9**: Ongoing (parallel with other phases)

**Total Estimated Time**: 4-5 weeks for robust, production-ready implementation

---

## Next Steps

1. Review and approve this implementation plan
2. Set up development environment
3. Begin Phase 1: Project Setup & Foundation
4. Establish daily/weekly progress checkpoints
5. Regular code reviews and testing checkpoints

