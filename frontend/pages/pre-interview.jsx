import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useRouter } from "next/router";

export default function PreInterviewPage() {
  const router = useRouter();
  const { generateInterview, loading, error } = useApi();

  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [industry, setIndustry] = useState("");

  async function startInterview() {
    if (!jobRole || !experience || !industry) {
      alert("Harap isi semua field.");
      return;
    }

    try {
      const response = await generateInterview({
        job_role: jobRole,
        experience_level: experience,
        industry: industry,
        num_questions: 5,
      });

      // redirect ke halaman interview
      router.push({
        pathname: "/interview",
        query: {
          session_id: response.session_id,
          questions: JSON.stringify(response.questions),
        },
      });
    } catch (err) {
      console.error(err);
      alert("Gagal memulai interview.");
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mulai Wawancara</h1>

      <div style={styles.form}>
        <label>Job Role</label>
        <input
          type="text"
          placeholder="Contoh: Software Engineer"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          style={styles.input}
        />

        <label>Experience Level</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          style={styles.input}
        >
          <option value="">Pilih level</option>
          <option value="Intern">Intern</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>

        <label>Industry</label>
        <input
          type="text"
          placeholder="Contoh: Tech / Finance / Marketing"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          style={styles.input}
        />

        <button onClick={startInterview} style={styles.button} disabled={loading}>
          {loading ? "Memulai..." : "Mulai Wawancara"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
};
