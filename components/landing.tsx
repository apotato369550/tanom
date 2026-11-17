"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Sprout, CloudRain } from "lucide-react";
import { TanomMark } from "./tanom-mark";
import { LanguageSwitch } from "./language-switch";
import "./landing.css";
export function Landing() {
  const [ceb, setCeb] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setCeb(localStorage.getItem("tanom-language") === "ceb"),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = ceb ? "ceb" : "en";
  }, [ceb]);
  const t = (en: string, ce: string) => (ceb ? ce : en);
  return (
    <div className="landing">
      <a className="landing-skip" href="#main">
        {t("Skip to content", "Adto sa sulod")}
      </a>
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <TanomMark />
          TANOM
        </Link>
        <nav aria-label={t("Main navigation", "Pangunang nabigasyon")}>
          <a href="#tools">{t("The tools", "Mga himan")}</a>
          <LanguageSwitch
            ceb={ceb}
            onChange={(value) => {
              setCeb(value);
              localStorage.setItem("tanom-language", value ? "ceb" : "en");
            }}
          />
          <Link href="/dashboard">
            {t("Open dashboard", "Ablihi ang dashboard")}{" "}
            <ArrowUpRight size={17} />
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> {t("ROOTED IN THE PHILIPPINES", "ALANG SA PILIPINAS")}
            </p>
            <h1>
              {t("A little more context.", "Dugang nga pagsabot.")}
              <br />
              <em>{t("For what you grow.", "Alang sa imong tanom.")}</em>
            </h1>
            <p className="hero-description">
              {t(
                "Weather guidance for Philippine growers. Explore rainfall, soil estimates and the seasons ahead—starting with your location.",
                "Giya sa panahon alang sa mga mag-uuma sa Pilipinas. Susihon ang ulan, banabana sa yuta ug umaabot nga panahon—sugod sa imong lokasyon.",
              )}
            </p>
            <div className="landing-actions">
              <Link className="landing-primary" href="/dashboard">
                {t("Open dashboard", "Ablihi ang dashboard")}{" "}
                <ArrowUpRight size={20} />
              </Link>
              <a href="#tools">
                {t("Explore the tools", "Susihon ang mga himan")} ↓
              </a>
            </div>
            <p className="landing-small">
              {t(
                "No account needed for weather and climate tools.",
                "Walay account nga gikinahanglan sa panahon ug klima.",
              )}
            </p>
          </div>
          <div className="field-visual">
            <svg
              viewBox="0 0 600 550"
              role="img"
              aria-label={t(
                "Rain above planted fields and layers of soil",
                "Ulan ibabaw sa uma ug mga lut-od sa yuta",
              )}
            >
              <defs>
                <clipPath id="field">
                  <path d="M50 300 300 170 550 300 300 440Z" />
                </clipPath>
              </defs>
              <circle cx="410" cy="100" r="44" fill="#E5BC61" />
              <path
                d="M100 150c-30 0-35-45 0-50 8-45 65-45 77-13 50-12 65 63 17 63Z"
                fill="#DCE9E9"
              />
              <g stroke="#236780" strokeWidth="3" strokeLinecap="round">
                {[115, 150, 185].map((x) => (
                  <path key={x} d={`M${x} 171l-8 24m-4 18-8 24`} />
                ))}
              </g>
              <path
                d="M50 300v70l250 140 250-140v-70L300 440Z"
                fill="#C9A475"
              />
              <path
                d="M50 330v20l250 140 250-140v-20L300 470Z"
                fill="#A78259"
              />
              <path d="M50 300 300 170 550 300 300 440Z" fill="#CAD7AE" />
              <g clipPath="url(#field)" stroke="#78905A" strokeWidth="17">
                {Array.from({ length: 12 }, (_, i) => (
                  <path key={i} d={`M${i * 55 - 250} 200l550 300`} />
                ))}
              </g>
              <g stroke="#365C38" strokeWidth="3" fill="#476B47">
                {[0, 1, 2, 3].flatMap((r) =>
                  [0, 1, 2, 3].map((c) => (
                    <g
                      key={`${r}-${c}`}
                      transform={`translate(${160 + c * 65 + r * 12} ${270 + r * 30 - c * 9})`}
                    >
                      <path d="M0 15V-6M0 4q-17 0-15-13Q0-10 0 4M0-2q15-2 14-15Q0-16 0-2" />
                    </g>
                  )),
                )}
              </g>
              <path d="M300 440v70" stroke="#876541" strokeWidth="2" />
            </svg>
            <div className="field-label">
              <CloudRain size={19} />
              {t(
                "Above the field. Below the surface.",
                "Ibabaw sa uma. Ilalom sa yuta.",
              )}
            </div>
          </div>
        </section>
        <section id="tools" className="landing-tools">
          <div className="section-intro">
            <p className="eyebrow">
              {t("THREE WAYS TO LOOK CLOSER", "TULO KA PAAGI SA PAGSUSI")}
            </p>
            <h2>
              {t(
                "Different questions. Dedicated tools.",
                "Lahi nga pangutana. Lahi nga himan.",
              )}
            </h2>
          </div>
          <div className="tool-grid">
            {[
              [
                "/conditions",
                "Conditions",
                "Kondisyon",
                "See hourly and daily temperature, rainfall and wind in one place.",
                "Tan-awa ang temperatura, ulan ug hangin matag oras ug adlaw.",
                "rain",
              ],
              [
                "/environment",
                "Environment",
                "Palibot",
                "Explore environmental estimates and crops that match local climate and elevation.",
                "Susihon ang palibot ug mga tanom nga nahiuyon sa klima ug kahabogon.",
                "soil",
              ],
              [
                "/planning",
                "Seasonal planning",
                "Plano sa panahon",
                "Compare the six-month outlook with the annual climate profile.",
                "Itandi ang unom ka bulan nga panglantaw ug tinuig nga klima.",
                "season",
              ],
            ].map(([href, en, ce, desc, cedesc, kind]) => (
              <Link className="tool-preview" href={href} key={href}>
                <div className={`preview-art ${kind}`} aria-hidden="true">
                  {kind === "soil" ? (
                    <>
                      <Sprout size={48} />
                      <span className="soil-layer" />
                      <span className="soil-layer" />
                    </>
                  ) : (
                    <div className="preview-bars">
                      {[28, 48, 35, 76, 90, 59, 34, 65, 43, 27, 51, 38].map(
                        (height, i) => (
                          <span key={i} style={{ height: height + "%" }} />
                        ),
                      )}
                    </div>
                  )}
                  <span className="preview-note">
                    {t("Illustrative preview", "Pananglitan lamang")}
                  </span>
                </div>
                <h3>
                  {t(en, ce)} <ArrowUpRight size={22} />
                </h3>
                <p>{t(desc, cedesc)}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="landing-location">
          <div className="location-symbol">
            <svg
              viewBox="0 0 300 450"
              role="img"
              aria-label={t("Philippines", "Pilipinas")}
            >
              <image href="/philippines-outline.svg" width="300" height="450" />
            </svg>
            <div className="location-lines" />
          </div>
          <div>
            <p className="eyebrow">
              {t("START WITH YOUR LOCATION", "SUGDI SA IMONG LOKASYON")}
            </p>
            <h2>
              {t(
                "The weather changes. So does the context.",
                "Mag-usab ang panahon. Ingon man ang kahimtang.",
              )}
            </h2>
            <p>
              {t(
                "Choose a Philippine location on the map or use your device location. Check current conditions, then open the crop or seasonal tool for a longer view.",
                "Pilia ang lokasyon sa mapa o gamita ang lokasyon sa imong device. Susihon ang kondisyon karon, dayon ablihi ang mga tanom o plano sa panahon.",
              )}
            </p>
            <Link className="landing-primary" href="/dashboard">
              {t("Choose your location", "Pilia ang imong lokasyon")}{" "}
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
        <section className="landing-limits">
          <p className="eyebrow">
            {t("CONTEXT, NOT CERTAINTY", "GIYA, DILI KASIGUROHAN")}
          </p>
          <h2>
            {t(
              "Useful estimates. Clear limits.",
              "Mapuslanong banabana. Klarong limitasyon.",
            )}
          </h2>
          <div className="limits-grid">
            <p>
              {t(
                "Forecasts describe expected weather. Soil values are modeled estimates, not measurements from your field.",
                "Ang forecast naghulagway sa gipaabot nga panahon. Ang datos sa yuta banabana lamang, dili sukod gikan sa imong uma.",
              )}
            </p>
            <p>
              {t(
                "Historical climate and seasonal outlooks support broad planning—not precise daily predictions. Crop matches do not guarantee suitability.",
                "Ang klima sa nangagi ug panglantaw makatabang sa pagplano—dili tukmang panagna matag adlaw. Ang pagpares sa tanom dili garantiya.",
              )}
            </p>
            <p>
              {t(
                "Optional AI reports depend on server configuration. TANOM does not predict flooding. Follow PAGASA and local authorities for official warnings.",
                "Ang opsyonal nga AI report nagdepende sa server. Dili motagna sa baha ang TANOM. Sunda ang PAGASA ug lokal nga awtoridad sa opisyal nga pasidaan.",
              )}
            </p>
          </div>
          <Link className="landing-primary" href="/dashboard">
            {t("Open dashboard", "Ablihi ang dashboard")}{" "}
            <ArrowUpRight size={20} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <span className="footer-brand">
          <TanomMark size={32} /> TANOM ·{" "}
          {t("Farm weather guidance", "Giya sa panahon sa uma")}
        </span>
        <span>
          {t(
            "Weather and climate data: Open-Meteo",
            "Datos sa panahon ug klima: Open-Meteo",
          )}
        </span>
      </footer>
    </div>
  );
}
