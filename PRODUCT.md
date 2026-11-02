# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

College students who want to discover clubs, join communities, register for events, and keep up with campus announcements without chasing group chats or spreadsheets. Club admins are students too: they need to manage one or more clubs, review membership requests, publish updates, and run events without a separate operations tool.

## Product Purpose

CampusConnect brings campus clubs, events, and announcements into one shared place. Success means a student can find a community and show up to something real, while a club admin can run the club's public presence and membership workflow without extra coordination overhead.

## Positioning

CampusConnect combines public discovery with per-club operations. Students see one campus-wide calendar and directory; approved club admins get scoped management tools for their own clubs. There is no global super-admin, and admin authority comes from approved club membership rather than a separate platform role.

## Operating Context

Students use the product between classes, often on a phone, to check what is happening and register quickly. Club admins use it before and after events to review requests, publish announcements, and keep event details current. The product is organized around the academic term: upcoming events, recent announcements, and a record of past events.

## Capabilities and Constraints

The first version covers four modules: authentication, clubs, events, and announcements. It uses Next.js App Router, React, Tailwind CSS, MySQL, and `mysql2` with parameterized SQL and no ORM. Club admins can edit their club, approve or reject membership requests, create/edit/delete events, view event participants, and publish/delete announcements. Students can register, request membership, register/cancel for events with capacity checks, and browse announcements. Out of scope: payment gateways, chat, attendance tracking, and a global super-admin.

## Brand Commitments

The product name is CampusConnect. The existing product copy is factual and should be preserved unless a change is required for clarity. The voice is student-first, direct, warm, and practical; it should not sound corporate or over-promise. No testimonials, customer logos, usage benchmarks, or partner claims may be invented.

## Evidence on Hand

The repository includes a seeded MySQL database with six users, four clubs, five events, and five announcements. Demo accounts are documented in the README. The existing pages and components are the current visual implementation and a record of the product's content and workflows. Real campus photography, club logos, and student testimonials are not available and must not be fabricated.

## Product Principles

1. Make the next action obvious, whether that is joining a club, registering for an event, or approving a request.
2. Keep the campus-wide view and the club-specific view connected; students should always know where they are and what belongs to whom.
3. Give club admins confidence through clear status, scoped controls, and honest empty states.
4. Preserve the product's real content and workflows; visual change must not turn into a different product.
5. Design for a busy student's attention: scannable, fast, and usable on a phone.

## Accessibility & Inclusion

Target WCAG 2.1 AA. All interactive controls need visible keyboard focus, sufficient contrast, and clear labels. Motion must respect `prefers-reduced-motion`. Layouts must remain usable at mobile widths and with long names, descriptions, and table content.
