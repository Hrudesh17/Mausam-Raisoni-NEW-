from typing import List, Optional
from pydantic import BaseModel, Field


class CalendarEvent(BaseModel):
    id: str
    title: str
    date: Optional[str] = None
    start_hour: int = Field(..., ge=0, le=23)
    end_hour: int = Field(..., ge=0, le=23)
    is_outdoor: bool = True
    location_name: Optional[str] = None
    notes: Optional[str] = None

class ActivityConfig(BaseModel):
    id: str
    name: str  # "Running", "Cycling", "Cricket", "Gardening"
    preferred_start_hour: int = 6
    preferred_end_hour: int = 8
    importance: str = "high"  # low, medium, high

class UserContext(BaseModel):
    name: str = "Ameya"
    is_personalized: bool = False
    
    # Flexible Multi-Select Interests
    # e.g. ["health", "running", "travel", "events", "gardening", "beach", "cycling"]
    interests: List[str] = Field(default_factory=lambda: ["health", "running", "events"])
    
    # Flexible Multi-Select Priorities (Weightings)
    # e.g. ["rain", "heat", "aqi", "uv", "wind", "cold"]
    priorities: List[str] = Field(default_factory=lambda: ["rain", "heat", "aqi"])
    

    # Environmental Sensitivities (e.g. ["pollen", "dust", "air_pollution", "humidity", "heat", "uv"])
    sensitivities: List[str] = Field(default_factory=list)
    
    # Optional Defined Activities
    activities: List[ActivityConfig] = Field(default_factory=list)
    
    # Optional Scheduled Calendar Events
    calendar_events: List[CalendarEvent] = Field(default_factory=lambda: [
        CalendarEvent(id="ev-1", title="Morning Run / Jog", start_hour=6, end_hour=7, is_outdoor=True),
        CalendarEvent(id="ev-3", title="Outdoor Cricket Match", start_hour=17, end_hour=19, is_outdoor=True),
    ])
    
    # Role-Specific Preferences & Telemetry Details
    role_details: Optional[dict] = None
    
    # Backward compatibility helper property
    @property
    def persona(self) -> str:
        if "gardening" in self.interests:
            return "farmer"
        if "running" in self.interests:
            return "runner"
        if "beach" in self.interests:
            return "coastal"
        return "runner"
