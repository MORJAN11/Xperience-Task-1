package com.xperience.hero.service;

import com.xperience.hero.dto.RSVPDTO;
import com.xperience.hero.dto.RSVPResponseRequest;
import com.xperience.hero.entity.*;
import com.xperience.hero.repository.EventRepository;
import com.xperience.hero.repository.InviteeRepository;
import com.xperience.hero.repository.RSVPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RSVPService {

    @Autowired
    private RSVPRepository rsvpRepository;

    @Autowired
    private InviteeRepository inviteeRepository;

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public RSVPDTO respondToRSVP(String token, RSVPResponseRequest request) {
        // Find invitee by token
        Invitee invitee = inviteeRepository.findByUniqueToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid RSVP link"));

        Event event = invitee.getEvent();

        // Check if event is locked
        if (LocalDateTime.now().isAfter(event.getStartDateTime())) {
            throw new RuntimeException("Event has started, RSVP is locked");
        }

        // Check if event is closed or cancelled
        if (event.getStatus() == EventStatus.CLOSED || event.getStatus() == EventStatus.CANCELLED) {
            throw new RuntimeException("Event is not accepting responses");
        }

        // Find or create RSVP
        RSVP rsvp = rsvpRepository.findByInviteeIdAndEventId(invitee.getId(), event.getId())
            .orElseGet(() -> new RSVP(invitee, event, RSVPStatus.MAYBE));

        // Determine status based on capacity
        RSVPStatus newStatus = request.getStatus();

        if (newStatus == RSVPStatus.YES) {
            // Check capacity
            if (event.getMaxCapacity() != null) {
                long confirmedCount = rsvpRepository.countConfirmedByEventId(event.getId());
                if (confirmedCount >= event.getMaxCapacity()) {
                    // Capacity reached, add to waitlist
                    newStatus = RSVPStatus.WAITLISTED;
                }
            }
        }

        // If changing from YES to NO, potentially promote from waitlist
        if (rsvp.getStatus() == RSVPStatus.YES && newStatus == RSVPStatus.NO) {
            rsvp.setStatus(newStatus);
            rsvp.setRespondedAt(LocalDateTime.now());
            rsvp = rsvpRepository.save(rsvp);

            // Promote from waitlist if applicable
            promoteFromWaitlist(event.getId());
        } else {
            rsvp.setStatus(newStatus);
            rsvp.setRespondedAt(LocalDateTime.now());
            rsvp = rsvpRepository.save(rsvp);
        }

        return convertToDTO(rsvp);
    }

    @Transactional
    public RSVPDTO getRSVPByToken(String token) {
        Invitee invitee = inviteeRepository.findByUniqueToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid RSVP link"));

        RSVP rsvp = rsvpRepository.findByInviteeIdAndEventId(invitee.getId(), invitee.getEvent().getId())
            .orElse(new RSVP(invitee, invitee.getEvent(), RSVPStatus.MAYBE));

        return convertToDTO(rsvp);
    }

    @Transactional
    private void promoteFromWaitlist(Long eventId) {
        Optional<RSVP> firstWaitlisted = rsvpRepository.findFirstWaitlistedByEventId(eventId);
        if (firstWaitlisted.isPresent()) {
            RSVP rsvp = firstWaitlisted.get();
            rsvp.setStatus(RSVPStatus.YES);
            rsvp.setRespondedAt(LocalDateTime.now());
            rsvpRepository.save(rsvp);
        }
    }

    private RSVPDTO convertToDTO(RSVP rsvp) {
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
