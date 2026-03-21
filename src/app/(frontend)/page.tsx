import Link from 'next/link'

import { getSiteChrome } from '@/lib/content'
import { getSiteSettings } from '@/lib/site-settings'

import './styles.css'

const yesNo = (value: boolean): string => (value ? 'Enabled' : 'Disabled')

export default async function HomePage() {
  const [siteChrome, settings] = await Promise.all([getSiteChrome(), getSiteSettings()])
  const spotlightLinks = siteChrome.header.navigation.slice(0, 3)
  const footerLinks = siteChrome.footer.socialLinks.slice(0, 3)

  return (
    <main className="home">
      <section className="hero">
        <div className="heroGrid">
          <div className="heroCopy">
            <div className="eyebrow">Future-ready CMS starter</div>
            <h1>{settings.siteDetails.siteName || 'Payload Starter'}</h1>
            <p className="lede">
              {settings.siteDetails.slogan ||
                'A reusable CMS foundation with RBAC, migrations, email, maintenance mode, redirects, and team-friendly structure already in place.'}
            </p>
            <div className="links">
              <Link className="admin" href="/admin" target="_blank">
                Open admin
              </Link>
              {settings.auth.allowRegistration ? (
                <Link className="secondary" href="/register">
                  Register
                </Link>
              ) : null}
              <Link className="secondary" href="/api/health">
                Health endpoint
              </Link>
              {settings.siteDetails.siteUrl ? (
                <a
                  className="secondary"
                  href={settings.siteDetails.siteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Public URL
                </a>
              ) : null}
            </div>
          </div>

          <aside className="heroConsole" aria-label="Starter system status">
            <div className="consoleHeader">
              <span className="consoleDot" />
              <span className="consoleDot" />
              <span className="consoleDot" />
              <strong>Starter Signals</strong>
            </div>
            <div className="statusRow">
              <div className="statusCard">
                <span>Maintenance</span>
                <strong>{yesNo(settings.maintenance.enabled)}</strong>
              </div>
              <div className="statusCard">
                <span>Registration</span>
                <strong>{yesNo(settings.auth.allowRegistration)}</strong>
              </div>
              <div className="statusCard">
                <span>Approval Flow</span>
                <strong>{yesNo(settings.auth.registrationRequiresApproval)}</strong>
              </div>
            </div>
            <div className="signalList">
              <div>
                <span>Header Links</span>
                <strong>{spotlightLinks.length}</strong>
              </div>
              <div>
                <span>Footer Links</span>
                <strong>{footerLinks.length}</strong>
              </div>
              <div>
                <span>Metadata</span>
                <strong>
                  {settings.meta.title || settings.meta.description ? 'Ready' : 'Default'}
                </strong>
              </div>
            </div>
          </aside>
        </div>
        <div className="heroBand">
          <div className="heroBandLabel">Starter posture</div>
          <p>
            Render deployment, PostgreSQL, shared content models, editorial routing, and
            registration controls are all shaped to be reused instead of copied project by project.
          </p>
          <div className="heroBandGrid">
            <span>Render</span>
            <span>PostgreSQL</span>
            <span>RBAC</span>
            <span>Shared Blocks</span>
            <span>Migrations</span>
            <span>Registration</span>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Navigation preview</h2>
          {spotlightLinks.length > 0 ? (
            <div className="linkStack">
              {spotlightLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  className="stackLink"
                  href={link.href}
                  rel={link.newTab ? 'noreferrer' : undefined}
                  target={link.newTab ? '_blank' : undefined}
                >
                  <span>{link.label}</span>
                  <small>{link.href}</small>
                </a>
              ))}
            </div>
          ) : (
            <p className="emptyState">
              Add header navigation items in Globals → Header to shape the frontend shell.
            </p>
          )}
        </article>

        <article className="panel">
          <h2>What ships with the starter</h2>
          <ul>
            <li>PostgreSQL + Render-ready configuration</li>
            <li>RBAC with super-admin, admin, and editor roles</li>
            <li>safe user lifecycle and last-super-admin protection</li>
            <li>schema migrations, app migrations, and local bootstrap scripts</li>
            <li>starter globals for settings, header, footer, redirects, and registration</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Suggested first steps</h2>
          <ol>
            <li>Create the first super-admin in `/admin`.</li>
            <li>Review `site-settings`, header, footer, and email mode.</li>
            <li>Rename `PROJECT_DB_NAME` before long-term local use.</li>
            <li>Commit migrations whenever schema fields or `dbName` values change.</li>
          </ol>
        </article>

        <article className="panel">
          <h2>Footer / social preview</h2>
          {footerLinks.length > 0 ? (
            <div className="pillRow">
              {footerLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  className="pillLink"
                  href={link.href}
                  rel={link.newTab ? 'noreferrer' : undefined}
                  target={link.newTab ? '_blank' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="emptyState">
              Footer social links are empty. Add them in Globals → Footer when the project is ready.
            </p>
          )}
          {settings.meta.title || settings.meta.description ? (
            <div className="metaBox">
              <strong>{settings.meta.title || settings.siteDetails.siteName}</strong>
              <p>
                {settings.meta.description ||
                  'Default metadata is ready to be used as a fallback across the frontend.'}
              </p>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}
