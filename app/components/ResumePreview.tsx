import { ResumeData } from "@/lib/builder";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { template } = data;

  if (template === "modern") {
    return <ModernTemplate data={data} />;
  } else if (template === "traditional") {
    return <TraditionalTemplate data={data} />;
  } else if (template === "ats-optimized") {
    return <ATSTemplate data={data} />;
  }

  return <ModernTemplate data={data} />;
}

// Modern Template (Two-column with blue accents)
function ModernTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="bg-white text-gray-900 shadow-lg" style={{ width: "210mm", minHeight: "297mm", fontSize: "10pt" }}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-1">
          {data.header.firstName} {data.header.lastName}
        </h1>
        <div className="text-sm space-y-0.5 text-blue-100">
          {data.header.email && <div>{data.header.email}</div>}
          {data.header.phone && <div>{data.header.phone}</div>}
          {(data.header.city || data.header.state) && (
            <div>
              {data.header.city}{data.header.city && data.header.state ? ", " : ""}{data.header.state}
            </div>
          )}
          {data.header.linkedin && <div>{data.header.linkedin}</div>}
          {data.header.website && <div>{data.header.website}</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6">
        {/* Left Column */}
        <div className="col-span-1 space-y-4">
          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Skills
              </h2>
              <div className="space-y-1">
                {data.skills.map((skill, i) => (
                  <div key={i} className="text-xs">• {skill}</div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Sections */}
          {data.additional?.certifications && data.additional.certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Certifications
              </h2>
              <div className="space-y-1">
                {data.additional.certifications.map((cert, i) => (
                  <div key={i} className="text-xs">• {cert}</div>
                ))}
              </div>
            </div>
          )}

          {data.additional?.languages && data.additional.languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Languages
              </h2>
              <div className="space-y-1">
                {data.additional.languages.map((lang, i) => (
                  <div key={i} className="text-xs">• {lang}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-2 space-y-4">
          {/* Summary */}
          {data.summary && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Experience
              </h2>
              <div className="space-y-3">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                      <span className="text-xs text-gray-600">
                        {exp.startMonth} {exp.startYear} - {exp.current ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {exp.employer}
                      {(exp.city || exp.state) && (
                        <span className="text-gray-500">
                          {" • "}
                          {exp.city}{exp.city && exp.state ? ", " : ""}{exp.state}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide border-b border-blue-200 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-sm font-semibold">{edu.degree} in {edu.field}</h3>
                      <span className="text-xs text-gray-600">
                        {edu.stillEnrolled ? "Expected " : ""}{edu.gradMonth} {edu.gradYear}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700">
                      {edu.school} • {edu.location}
                    </div>
                    {edu.details && (
                      <p className="text-xs text-gray-600 mt-0.5">{edu.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Traditional Template (Single-column, classic format)
function TraditionalTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="bg-white text-gray-900 shadow-lg p-8" style={{ width: "210mm", minHeight: "297mm", fontSize: "11pt" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-3xl font-bold mb-2">
          {data.header.firstName} {data.header.lastName}
        </h1>
        <div className="text-sm text-gray-700 space-x-3">
          {data.header.email && <span>{data.header.email}</span>}
          {data.header.phone && <span>• {data.header.phone}</span>}
          {(data.header.city || data.header.state) && (
            <span>
              • {data.header.city}{data.header.city && data.header.state ? ", " : ""}{data.header.state}
            </span>
          )}
        </div>
        {(data.header.linkedin || data.header.website) && (
          <div className="text-sm text-gray-700 space-x-3 mt-1">
            {data.header.linkedin && <span>{data.header.linkedin}</span>}
            {data.header.website && <span>• {data.header.website}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Experience
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-base font-bold">{exp.jobTitle}</h3>
                  <span className="text-sm text-gray-600">
                    {exp.startMonth} {exp.startYear} - {exp.current ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {exp.employer}
                  {(exp.city || exp.state) && (
                    <span className="text-gray-500 font-normal">
                      {" • "}
                      {exp.city}{exp.city && exp.state ? ", " : ""}{exp.state}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-base font-bold">{edu.degree} in {edu.field}</h3>
                  <span className="text-sm text-gray-600">
                    {edu.stillEnrolled ? "Expected " : ""}{edu.gradMonth} {edu.gradYear}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  {edu.school} • {edu.location}
                </div>
                {edu.details && (
                  <p className="text-sm text-gray-600 mt-0.5">{edu.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Skills
          </h2>
          <p className="text-sm">{data.skills.join(" • ")}</p>
        </div>
      )}

      {/* Additional Sections */}
      {data.additional?.certifications && data.additional.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Certifications
          </h2>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {data.additional.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {data.additional?.awards && data.additional.awards.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Awards & Achievements
          </h2>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {data.additional.awards.map((award, i) => (
              <li key={i}>{award}</li>
            ))}
          </ul>
        </div>
      )}

      {data.additional?.languages && data.additional.languages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">
            Languages
          </h2>
          <p className="text-sm">{data.additional.languages.join(" • ")}</p>
        </div>
      )}
    </div>
  );
}

// ATS-Optimized Template (Simple, machine-readable format)
function ATSTemplate({ data }: ResumePreviewProps) {
  return (
    <div className="bg-white text-gray-900 shadow-lg p-8" style={{ width: "210mm", minHeight: "297mm", fontSize: "11pt", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">
          {data.header.firstName} {data.header.lastName}
        </h1>
        <div className="text-sm text-gray-700">
          {data.header.email && <div>{data.header.email}</div>}
          {data.header.phone && <div>{data.header.phone}</div>}
          {(data.header.city || data.header.state) && (
            <div>
              {data.header.city}{data.header.city && data.header.state ? ", " : ""}{data.header.state}
            </div>
          )}
          {data.header.linkedin && <div>{data.header.linkedin}</div>}
          {data.header.website && <div>{data.header.website}</div>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Work Experience
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="font-bold text-sm">{exp.jobTitle}</div>
                <div className="text-sm">
                  {exp.employer}
                  {(exp.city || exp.state) && (
                    <span>
                      {" | "}
                      {exp.city}{exp.city && exp.state ? ", " : ""}{exp.state}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {exp.startMonth} {exp.startYear} - {exp.current ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="font-bold text-sm">{edu.degree} in {edu.field}</div>
                <div className="text-sm">{edu.school} | {edu.location}</div>
                <div className="text-sm text-gray-600">
                  {edu.stillEnrolled ? "Expected " : ""}{edu.gradMonth} {edu.gradYear}
                </div>
                {edu.details && (
                  <p className="text-sm text-gray-600">{edu.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Skills
          </h2>
          <p className="text-sm">{data.skills.join(", ")}</p>
        </div>
      )}

      {/* Additional Sections */}
      {data.additional?.certifications && data.additional.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Certifications
          </h2>
          <div className="text-sm space-y-0.5">
            {data.additional.certifications.map((cert, i) => (
              <div key={i}>{cert}</div>
            ))}
          </div>
        </div>
      )}

      {data.additional?.awards && data.additional.awards.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Awards & Achievements
          </h2>
          <div className="text-sm space-y-0.5">
            {data.additional.awards.map((award, i) => (
              <div key={i}>{award}</div>
            ))}
          </div>
        </div>
      )}

      {data.additional?.languages && data.additional.languages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-1 uppercase">
            Languages
          </h2>
          <p className="text-sm">{data.additional.languages.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
