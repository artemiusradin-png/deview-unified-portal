# Product Requirements Document

## Project
Unified Business Data Portal for `deviewai.com`

## Version
Draft v1.0

## Date
April 15, 2026

## Prepared By
DeView

## 1. Executive Summary

The client wants a secure internal web platform that brings together multiple existing business databases and operating systems into one place. The platform should allow staff to search for an individual customer or related entity by ID number, phone number, or name, and then view a consolidated profile containing operational, financial, relationship, approval, repayment, and write-off information across the client’s businesses.

This product is not a basic marketing website. It is an internal business operations portal and unified data access layer. The primary goal is to replace fragmented workflows, manual cross-checking, and repeated login or lookup steps with a single search-driven interface that provides a complete view of a customer record.

Based on the client brief, the current data appears to be stored in an existing system website and updated manually on a daily basis. The first version of the product should therefore prioritize data aggregation, search, profile visibility, permissions, and operational clarity before attempting heavy workflow automation.

## 2. Problem Statement

The client currently operates across multiple databases, business units, and data views that are not unified in a single interface. Staff must manually search different systems and reconcile records to understand a borrower, lender, or related person. This causes:

- Slow customer lookup and case review
- Duplicate manual work across teams
- Higher risk of missed information
- Inconsistent operational decisions
- Limited visibility into related-party, loan, approval, and repayment history
- Dependence on manual daily updates

The business needs a single internal portal that consolidates these data sources into one operational interface.

## 3. Product Vision

Build a secure web-based internal portal where authorized staff can search once and immediately access a unified customer record spanning all relevant businesses, databases, and loan lifecycle information.

The system should become the primary working surface for cross-business case review, customer lookup, repayment monitoring, and operational decision support.

## 4. Goals

### Business Goals

- Create one place to access all relevant customer and loan data
- Reduce manual searching across separate systems
- Improve speed and consistency of customer and loan review
- Support better operational decisions using a complete record view
- Reduce errors caused by fragmented records or missing related information
- Establish a scalable foundation for future automation and analytics

### Product Goals

- Enable fast unified search by ID number, phone number, or name
- Return a clear results list with enough detail to identify the correct record
- Show a consolidated customer detail page with all key tabs/modules
- Normalize data from multiple systems into one coherent view
- Support role-based access to sensitive financial and operational data
- Maintain traceability through logs and audit history

### User Goals

- Find a borrower or customer in seconds
- See all relevant loan and relationship information in one view
- Understand current and historical status without opening multiple systems
- Review repayment, approval, and write-off history efficiently
- Identify related parties and historical partaking relationships quickly

## 5. Non-Goals for MVP

- Full replacement of every legacy system workflow on day one
- Advanced AI recommendations or autonomous decisioning
- Complex loan origination workflow redesign
- Public-facing customer self-service portal
- Real-time two-way writeback into every source system unless explicitly required
- Full data warehouse or BI initiative beyond operational search and record access

## 6. Users and Stakeholders

### Primary Users

- Operations staff
- Loan servicing staff
- Approval and review teams
- Collection or repayment teams
- Customer support or front-desk staff
- Management users who need consolidated record visibility

### Secondary Users

- Compliance or audit staff
- Business owners or senior leadership
- IT or data administrators

### Stakeholders

- Client founder / business owner
- Business operations leads
- IT / system administrator
- Data owners for each business/database
- DeView product and engineering team

## 7. Current-State Findings From Client Brief

The client brief currently confirms the following:

- The system must combine multiple databases and businesses
- Users need a search bar that supports:
  - ID number
  - phone number
  - name
- Users need a search result table
- Users need lender or borrower information including:
  - Apply Info
  - Partakers
  - Credit Ref
  - Document
  - Mortgage
  - Income/Expenditure (DSR)
  - Loan History
  - Partaking History
  - Approval Info
  - Repay History
  - Repay Condition
  - CRM
  - OCA / Write-off
- The client wants a list of all databases including names, formats, locations, and screenshots
- The current data source location appears to be a system website
- Current updates are manual and daily

## 8. Assumptions

The following assumptions are being made until validated with the client:

- The platform is for internal staff use, not public consumers
- Each business or business unit has its own underlying data source or logical dataset
- Some source systems may only be accessible through web interfaces rather than direct database access
- There is a common person or borrower identity that can be matched through ID number, phone number, name, or internal application/loan identifiers
- Some fields may be duplicated or inconsistent across systems and will require precedence rules
- The first release should be read-heavy, with limited editing capabilities unless editing is a hard requirement
- Sensitive financial information requires strict permissions and audit logs

## 9. Key Open Questions

These questions must be answered during discovery before final technical scoping:

- What are the exact names of all businesses and systems to be combined?
- For each source, what is the storage format?
  - SQL database
  - website admin panel
  - Excel
  - CSV
  - CRM
  - cloud drive
  - API
- Do we have direct database access or only application-level access?
- Which fields uniquely identify a customer across systems?
- Which fields are source-of-truth fields when systems disagree?
- Is the first version read-only or must users update records in the new portal?
- What user roles exist, and what can each role view or edit?
- Are there compliance requirements for data retention, masking, and access logs?
- Does the client require file/document upload and preview in the first release?
- Are there existing screenshots or exports for every required data source?

## 10. Product Scope

### Core Scope

- Unified internal web portal
- Global search across all connected businesses/data sources
- Search results view
- Consolidated customer or borrower profile
- Tabbed modules for operational detail
- Role-based access control
- Audit logging
- Admin/data source management capability

### Suggested MVP Scope

- Manual or scheduled ETL from source systems into a unified operational store
- Search by ID number, phone number, and customer name
- Search result table with key identifying fields
- Customer 360 profile page
- Tabs for all client-requested information areas
- Read-only detail views for most modules
- Basic admin controls for user access
- Activity logging

### Phase 2 Scope

- Inline editing and writeback to selected source systems
- Real-time sync where technically feasible
- Workflow tasks, reminders, and case assignment
- Analytics dashboards
- Related-entity graph view
- Alerts for repayment risk, blacklist matches, or approval exceptions
- AI-assisted summarization or record review

## 11. Functional Requirements

### 11.1 Authentication and Access

- Users must log in securely to access the platform
- Access must be restricted to authorized internal users
- The system must support role-based permissions
- Sensitive modules must be visible only to authorized roles
- The system should support session timeout and secure logout

### 11.2 Global Search

The system must provide a prominent search experience that allows users to search using:

- ID number
- Phone number
- Name
- Optional future fields:
  - passport number
  - loan number
  - application number

Search must:

- Return results quickly
- Support partial and exact matching where appropriate
- Handle duplicate names safely
- Surface the best matches first
- Allow filtering by source, branch, status, or business unit in future versions

### 11.3 Search Results

The system must show search results in a table that helps users identify the correct record. Recommended columns:

- Status
- Loan type
- Application number
- Loan number
- Apply date
- Passport or ID number
- Name
- Mobile number
- Partaker type
- Blacklist flag
- Source system / business

Users must be able to click a result to open the full profile.

### 11.4 Customer / Borrower 360 Profile

The system must present a unified profile page for each matched customer, borrower, or relevant entity. This page should consolidate information from all relevant businesses and systems and group it into clear modules.

The profile should include, at minimum:

- Basic identity information
- Matching identifiers
- Linked loans and applications
- Related people / partakers
- Historical actions
- Financial and repayment records
- Approval and servicing details
- Operational notes or CRM information

### 11.5 Required Profile Modules

The following modules are required based on the client brief.

#### A. Apply Info

- Application metadata
- Product / loan type
- Branch or business unit
- Application date
- Current application status
- Applicant identifiers

#### B. Partakers

- Related people/entities linked to the applicant
- Relationship type
- Contact details
- Cross-linked records where relevant

#### C. Credit Ref

- Credit reference information
- Credit-related notes or indicators
- External/internal credit data if available

#### D. Document

- Uploaded or linked documents
- Document type
- Upload / creation date
- Preview / download action if permitted

#### E. Mortgage

- Mortgage-related fields if applicable
- Asset / collateral detail
- Property-linked records

#### F. Income / Expenditure (DSR)

- Income fields
- Expense fields
- Debt servicing ratio data
- Supporting financial calculation fields where available

#### G. Loan History

- Historical loans
- Loan statuses over time
- Product type
- Origination and servicing timeline

#### H. Partaking History

- Historical related-party records
- Previous associated applications or loans
- Frequency and nature of associations

#### I. Approval Info

- Approval status
- Approval date
- Reviewer / approver
- Approval notes
- Decision reason where available

#### J. Repay History

- Repayment timeline
- Payment dates
- Amounts recovered
- Outstanding balances
- Charges and fees
- Collection records where available

#### K. Repay Condition

- Current repayment terms
- Current repayment state
- Collection conditions
- Delinquency / overdue indicators

#### L. CRM

- Internal notes
- Customer interaction history
- Case management notes
- Follow-up context

#### M. OCA / Write-off

- OCA records
- Write-off records
- Recovery activity
- Related charges / solicitor information
- Recovery totals and balance information

### 11.6 Multi-Source Data Consolidation

The system must combine data from multiple sources into one record view.

This requires:

- Source mapping for each data provider/system
- Identity resolution logic to match records across systems
- Field normalization so labels and values are consistent
- Clear indication of source origin when needed
- Conflict handling when multiple systems disagree

### 11.7 Admin and Configuration

Admin users should be able to:

- Manage users and roles
- View source-system connection status
- Review sync/update logs
- Manage field mappings in later versions
- Review audit logs

### 11.8 Audit and Monitoring

The system must log:

- User login/logout
- Searches performed
- Profile views
- Sensitive data access
- Data sync jobs
- Record edits if editing is enabled

## 12. Data Requirements

### 12.1 Source Inventory Requirement

Before implementation, a source inventory must be created for every database/system being combined. For each source, capture:

- Source name
- Business owner
- Business unit
- Format
- Storage location
- Access method
- Refresh/update method
- Refresh frequency
- Key identifiers available
- Key tables or entities
- Screenshot of current interface
- Data quality notes

### 12.2 Core Entities

- Person / customer
- Borrower
- Loan
- Application
- Repayment
- Approval
- Related party / partaker
- Document
- Collection / write-off record
- CRM note

### 12.3 Identity Resolution

The system must define how a person is matched across multiple systems. Candidate matching keys include:

- National ID / passport / identity number
- Phone number
- Name
- Loan number
- Application number
- Internal customer ID

Matching logic should support:

- Exact match
- Standardized phone matching
- Alias / name normalization
- Confidence scoring for possible future use

## 13. User Experience Requirements

### UX Principles

- Search-first workflow
- Minimal clicks to key information
- Dense but readable operational UI
- Clear grouping of financial and historical data
- Fast navigation between result list and full profile
- Consistent module layout
- Visible source context where useful

### Key Screens

- Login screen
- Dashboard / landing page
- Global search page
- Search results page
- Customer 360 profile page
- Admin / users page
- Audit / sync log page

### Design Direction

The interface should feel operational and trustworthy rather than promotional. It should be optimized for internal use by staff handling many records per day. The design should emphasize:

- clarity
- speed
- scanability
- structured tabular information
- obvious status indicators

## 14. Non-Functional Requirements

### Performance

- Search results should load quickly for normal queries
- Profile pages should render without noticeable delay for standard records
- The system should support concurrent internal staff usage

### Security

- Encrypted transport over HTTPS
- Secure credential management
- Role-based access control
- Audit logging for sensitive actions
- Masking of especially sensitive fields if required

### Reliability

- Stable uptime during working hours
- Error handling for unavailable source systems
- Clear status indicators when source data is stale or unavailable

### Scalability

- Architecture should support adding more businesses and source systems over time
- Data model should support additional modules without major redesign

### Maintainability

- Modular integration architecture
- Clear field mapping documentation
- Environment-based configuration
- Structured logs and monitoring

## 15. Recommended Solution Approach

### Recommended MVP Architecture

- Frontend: secure internal web application
- Backend: API layer for search, profile aggregation, auth, and admin
- Unified operational database: normalized store for search and profile rendering
- Integration layer: connectors or ETL jobs that pull from each legacy source
- Admin/logging layer: user management, sync logs, audit trails

### Integration Strategy

Given that the client currently updates records manually and may rely on an existing system website, the safest MVP approach is:

- Inventory all source systems
- Establish access method for each source
- Pull data into a unified read model on a scheduled basis
- Expose the unified read model through the new portal

This is preferable to immediate deep writeback because source access and data quality are still unknown.

### Read Model vs Writeback

Recommended for MVP:

- Read-heavy portal
- Scheduled updates
- Optional limited note-taking or CRM additions inside the new portal

Defer until later:

- Full transactional writeback to all legacy systems
- Real-time operational editing across every connected source

## 16. Success Metrics

### Business Metrics

- Reduction in average time to find a customer record
- Reduction in number of systems opened per case review
- Reduction in manual reconciliation steps
- Improvement in staff productivity for case lookup and review

### Product Metrics

- Search success rate
- Search response time
- Profile page usage per user
- Number of active internal users
- Frequency of use by business unit

### Data Metrics

- Match rate across systems
- Sync success rate
- Number of stale records
- Number of unresolved duplicate identities

## 17. Risks and Constraints

### Risks

- Legacy systems may not expose direct APIs or DB access
- Source data may be inconsistent, duplicated, or incomplete
- Identity matching across systems may be unreliable
- Sensitive financial data may require stronger compliance controls
- Manual daily updates may introduce stale data windows

### Constraints

- Unknown source formats and access methods
- Unknown number of businesses and records
- Unknown permissions model
- Potential dependency on screenshots/manual extraction during discovery

## 18. Dependencies

- Client access to every source system
- Source inventory completion
- Field mapping and data dictionary creation
- User role and permissions definition
- Infrastructure and hosting decision
- Security review for sensitive data handling

## 19. MVP Acceptance Criteria

The MVP will be considered successful if:

- Authorized users can log in securely
- Users can search by ID number, phone number, or name
- Search returns results from all in-scope connected sources
- Users can open a consolidated profile from a search result
- The profile contains the required modules from the client brief
- Data source and refresh state are visible where needed
- User access is permission-controlled
- Audit logs capture key access and search actions

## 20. Discovery Deliverables Required Before Engineering Build

- Full source-system inventory
- Data dictionary for each source
- Entity relationship mapping
- Identity matching rules
- Permissions matrix by role
- MVP module prioritization
- API/integration feasibility assessment
- Wireframes for:
  - search
  - results
  - customer 360 profile
  - admin

## 21. Recommended Delivery Plan

### Phase 0: Discovery

- Interview client stakeholders
- Inventory all databases and systems
- Gather screenshots and sample exports
- Define users, roles, and access rules
- Confirm MVP scope

### Phase 1: Foundation

- Set up application architecture
- Build auth and permission layer
- Create unified data model
- Build ingestion pipeline for first source systems

### Phase 2: MVP Build

- Build search
- Build results table
- Build customer 360 profile
- Build required tabs/modules
- Build admin and logs

### Phase 3: Validation and Rollout

- User testing with operations staff
- Data validation against legacy systems
- Bug fixing and permissions hardening
- Controlled production rollout

### Phase 4: Expansion

- Add more systems
- Add writeback where needed
- Add analytics and AI assistance

## 22. Recommendation to Client

The project should be positioned to the client as a unified internal operations platform, not merely a website redesign. The strongest MVP is a secure, search-led portal that consolidates customer, loan, repayment, approval, and related-party information across all businesses into one interface.

The immediate next step should be a formal discovery workshop focused on source inventory, access methods, identity matching, and role permissions. Without that, engineering estimates will be weak and integration risk will remain high.

## 23. Appendix: Initial Feature Summary

### Must-Have

- Secure login
- Role-based access
- Search by ID, phone, name
- Search results table
- Unified customer profile
- Modules for all client-requested data groups
- Audit logs

### Should-Have

- Source freshness indicator
- Export/print option
- Record relationship visibility
- Admin sync status view

### Could-Have Later

- AI summary of customer case
- Risk flags and alerts
- Workflow tasks and assignment
- Real-time legacy system writeback
