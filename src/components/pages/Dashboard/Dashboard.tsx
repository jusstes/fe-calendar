import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectEvents, selectLoading } from "../../../store/events/selectors";
import { getEventsThunk } from "../../../store/events/thunks";
import { getUserThunk } from "../../../store/user/thunks";
import Header from "../../molecules/Header";
import { Event, Roles, User } from "../../../domain";
import EventsCalendar from "../../organisms/EventsCalendar";
import YearSelect from "../../atoms/YearSelect";
import styles from "./styles.module.css";
import { setLoading } from "../../../store/events/eventsSlice";
import ModalComponent from "../../molecules/ModalComponent/ModalComponent";
import { Routes } from "../../../constants/routes";
import { selectUser } from "../../../store/user/selectors";
import { setIsLogged } from "../../../store/auth/authSlice";
import ScheduleEventForm from "../../molecules/ScheduleEventForm";

const Dashboard: FC = () => {
  const dispatch = useDispatch();
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");

  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(getUserThunk());
    dispatch(getEventsThunk(year));
  }, [dispatch, year]);

  const generateArrayOfYears = () => {
    const max = new Date().getFullYear();
    const min = 2016;
    const years = [];

    for (let i = min; i <= max; i += 1) {
      years.push(i.toString());
    }
    return years;
  };

  const years = generateArrayOfYears();

  const events: Event[] = useSelector(selectEvents);
  const isLoading: boolean = useSelector(selectLoading);
  const user: User | null = useSelector(selectUser);

  if (user?._id) dispatch(setIsLogged(true));

  const selectedEvent =
    events.find(
      ({ uid, _id }) => uid === selectedEventId || _id === selectedEventId
    ) ?? events[0];
  
  const onDayClick = (e: any) => {
    setSelectedEventId(e.events[0].id)
    setIsOpen(true);
  }

  return (
    <div className={styles["calendar-container"]}>
      <ModalComponent isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ScheduleEventForm
          event={selectedEvent}
          onSubmit={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </ModalComponent>
      <Header
        buttonTitle={user?.role === Roles.ADMIN ? "Requests" : "Scheduled"}
        buttonRouter={
          user?.role === Roles.ADMIN ? Routes.REQUESTS : Routes.SCHEDULED
        }
      />
      <div className={styles["year-select-container"]}>
        <YearSelect
          options={years}
          value={year}
          setValue={setYear}
          label="Current year"
        />
      </div>
      <EventsCalendar
        isLoading={isLoading}
        year={year.toString()}
        events={events}
        onDayClick={onDayClick}
      />
    </div>
  );
};
export default Dashboard;
