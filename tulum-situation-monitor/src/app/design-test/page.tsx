"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";

export default function DesignTestPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [glassModalOpen, setGlassModalOpen] = useState(false);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", background: "#F5F5F5", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px", color: "#1A1A1A" }}>
        🎨 Design System Test Page
      </h1>

      {/* Buttons Section */}
      <Card variant="elevated" style={{ marginBottom: "32px" }}>
        <CardHeader title="Button Variants" subtitle="All button styles and sizes" />
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="glass">Glass Button</Button>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button variant="primary" leftIcon="🚀">With Icon</Button>
              <Button variant="secondary" rightIcon="→">Arrow</Button>
              <Button variant="primary" loading>Loading...</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <Card variant="flat">
          <CardHeader title="Flat Card" subtitle="Simple border style" />
          <CardContent>
            <p style={{ color: "#666" }}>This card has a flat design with a simple border and no shadow.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">Learn More</Button>
          </CardFooter>
        </Card>

        <Card variant="elevated">
          <CardHeader title="Elevated Card" subtitle="With shadow" />
          <CardContent>
            <p style={{ color: "#666" }}>This card has elevation with a subtle shadow that lifts on hover.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">Learn More</Button>
          </CardFooter>
        </Card>

        <Card variant="glass">
          <CardHeader title="Glass Card" subtitle="Glassmorphism effect" />
          <CardContent>
            <p style={{ color: "#666" }}>This card uses glassmorphism with backdrop blur for a modern look.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">Learn More</Button>
          </CardFooter>
        </Card>

        <Card variant="glassHeavy">
          <CardHeader title="Heavy Glass Card" subtitle="More opaque" />
          <CardContent>
            <p style={{ color: "#666" }}>This card has heavier glassmorphism for better readability.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm">Learn More</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Inputs Section */}
      <Card variant="elevated" style={{ marginBottom: "32px" }}>
        <CardHeader title="Input Components" subtitle="Modern form inputs" />
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              leftIcon="📧"
            />

            <Input
              label="Search"
              placeholder="Search something..."
              leftIcon="🔍"
              rightIcon={
                <button style={{ background: "none", border: "none", cursor: "pointer" }}>×</button>
              }
            />

            <Input
              label="With Error"
              placeholder="This field has an error"
              error="This field is required"
            />

            <Input
              label="Disabled Input"
              placeholder="Cannot edit this"
              disabled
            />

            <Textarea
              label="Message"
              placeholder="Type your message here..."
              helperText="Maximum 500 characters"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals Section */}
      <Card variant="elevated" style={{ marginBottom: "32px" }}>
        <CardHeader title="Modal Components" subtitle="Modern modal dialogs" />
        <CardContent>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Standard Modal
            </Button>
            <Button variant="glass" onClick={() => setGlassModalOpen(true)}>
              Open Glass Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Utility Classes */}
      <Card variant="elevated">
        <CardHeader title="Utility Classes" subtitle="Global CSS utilities" />
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="glass" style={{ padding: "20px", borderRadius: "12px" }}>
              <strong>Glass Effect</strong> - Using .glass class
            </div>

            <div className="card-elevated hover-lift" style={{ padding: "20px" }}>
              <strong>Hover Lift</strong> - Hover over this card
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div className="shadow-soft" style={{ padding: "16px", background: "white", borderRadius: "8px" }}>
                Soft Shadow
              </div>
              <div className="shadow-float" style={{ padding: "16px", background: "white", borderRadius: "8px" }}>
                Float Shadow
              </div>
              <div className="shadow-glow" style={{ padding: "16px", background: "white", borderRadius: "8px" }}>
                Glow Shadow
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standard Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Standard Modal"
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p>This is a standard modal with backdrop blur and smooth animations.</p>
          <Input label="Name" placeholder="Enter your name" fullWidth />
          <Input label="Email" placeholder="Enter your email" type="email" fullWidth />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Glass Modal */}
      <Modal
        isOpen={glassModalOpen}
        onClose={() => setGlassModalOpen(false)}
        title="Glass Modal"
        size="md"
        glass
        heavyBackdrop
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p>This is a glass modal with glassmorphism effect and heavy backdrop blur.</p>
          <Card variant="glass">
            <CardContent>
              <p style={{ color: "#666", margin: 0 }}>
                Glass cards work great inside glass modals for a layered glassmorphism effect!
              </p>
            </CardContent>
          </Card>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
            <Button variant="ghost" onClick={() => setGlassModalOpen(false)}>
              Close
            </Button>
            <Button variant="glass" onClick={() => setGlassModalOpen(false)}>
              Awesome!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
