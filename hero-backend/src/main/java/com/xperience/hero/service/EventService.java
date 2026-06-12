package com.xperience.hero.service;

import com.xperience.hero.dto.*;
import com.xperience.hero.entity.*;
import com.xperience.hero.repository.EventRepository;
import com.xperience.hero.repository.InviteeRepository;
import com.xperience.hero.repository.RSVPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InviteeRepository inviteeRepository;

    @Autowired
    private RSVPRepository rsvpRepository;

    @Transactional
    public EventDTO createEvent(CreateEventRequest request) {
        Event event = new Event(
            request.getTitle(),
            request.getDescription(),
            request.getLocation(),
            request.getStartDateTime(),
            request.getMaxCapacity(),
            request.getHostEmail()
        );
        event = eventRepository.save(event);
        return convertToDTO(event);
    }

    public EventDTO getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDTO(event);
    }

    @Transactional
    public List<InviteeDTO> inviteAttendees(Long eventId, String[] emails) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        List<InviteeDTO> result = new java.util.ArrayList<>();
        for (String email : emails) {
            Invitee invitee = inviteeRepository.findByEventIdAndEmail(eventId, email)
                .orElseGet(() -> inviteeRepository.save(new Invitee(event, email)));
            result.add(convertInviteeToDTO(invitee));
        }
        return result;
    }

    public List<InviteeDTO> getInvitees(Long eventId, String hostEmail) {
        eventRepository.findByIdAndHostEmail(eventId, hostEmail)
            .orElseThrow(() -> new RuntimeException("Event not found or not authorized"));
        return inviteeRepository.findByEventId(eventId).stream()
            .map(this::convertInviteeToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void cancelEvent(Long eventId, String hostEmail) {
        Event event = eventRepository.findByIdAndHostEmail(eventId, hostEmail)
            .orElseThrow(() -> new RuntimeException("Event not found or not authorized"));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    @Transactional
    public void closeEvent(Long eventId, String hostEmail) {
        Event event = eventRepository.findByIdAndHostEmail(eventId, hostEmail)
            .orElseThrow(() -> new RuntimeException("Event not found or not authorized"));
        event.setStatus(EventStatus.CLOSED);
        eventRepository.save(event);
    }

    @Transactional
    public void lockExpiredEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> expiredEvents = eventRepository.findByStartDateTimeBefore(now);
        for (Event event : expiredEvents) {
            if (event.getStatus() == EventStatus.OPEN_FOR_RSVPS) {
                event.setStatus(EventStatus.LOCKED);
                eventRepository.save(event);
            }
        }
    }

    public DashboardDTO getDashboard(Long eventId, String hostEmail) {
        Event event = eventRepository.findByIdAndHostEmail(eventId, hostEmail)
            .orElseThrow(() -> new RuntimeException("Event not found or not authorized"));

        EventDTO eventDTO = convertToDTO(event);

        List<RSVP> rsvps = rsvpRepository.findByEventId(eventId);
        long yesCount = rsvps.stream().filter(r -> r.getStatus() == RSVPStatus.YES).count();
        long noCount = rsvps.stream().filter(r -> r.getStatus() == RSVPStatus.NO).count();
        long maybeCount = rsvps.stream().filter(r -> r.getStatus() == RSVPStatus.MAYBE).count();
        long waitlistCount = rsvps.stream().filter(r -> r.getStatus() == RSVPStatus.WAITLISTED).count();

        List<RSVPDTO> attendees = rsvps.stream()
            .map(this::convertRSVPToDTO)
            .collect(Collectors.toList());

        return new DashboardDTO(eventDTO, yesCount, noCount, maybeCount, waitlistCount, attendees);
    }

    private EventDTO convertToDTO(Event event) {
        return new EventDTO(
            event.getId(),
            event.getTitle(),
            event.getDescription(),
            event.getLocation(),
            event.getStartDateTime(),
            event.getMaxCapacity(),
            event.getHostEmail(),
            event.getStatus(),
            event.getCreatedAt(),
            event.getUpdatedAt()
        );
    }

    private InviteeDTO convertInviteeToDTO(Invitee invitee) {
        return new InviteeDTO(
            invitee.getId(),
            invitee.getEvent().getId(),
            invitee.getEmail(),
            invitee.getUniqueToken()
        );
    }

    private RSVPDTO convertRSVPToDTO(RSVP rsvp) {
        return new RSVPDTO(
            rsvp.getId(),
            rsvp.getInvitee().getId(),
            rsvp.getEvent().getId(),
            rsvp.getInvitee().getEmail(),
            rsvp.getStatus(),
            rsvp.getRespondedAt(),
            rsvp.getCreatedAt(),
            rsvp.getUpdatedAt()
        );
    }
}
