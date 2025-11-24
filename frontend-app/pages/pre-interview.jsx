import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useState } from "react";

export default function PreInterview() {
  const [job, setJob] = useState("");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Mulai Wawancara</h2>

        <div className="space-y-4">
          <div>
            <label>Job Role</label>
            <Input value={job} onChange={e => setJob(e.target.value)} placeholder="Software Engineer" />
          </div>

          <div>
            <label>Experience Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-2"
            >
              <option>Pilih level</option>
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </div>

          <div>
            <label>Industry</label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Tech / Finance / Marketing" />
          </div>
        </div>

        <Button
          className="mt-6 w-full"
          onClick={() => {
            window.location.href = `/interview?job=${job}&level=${level}&industry=${industry}`;
          }}
        >
          Mulai Wawancara
        </Button>
      </Card>
    </div>
  );
}
