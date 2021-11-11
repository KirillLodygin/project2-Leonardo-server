const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} = graphql;

const { GraphQLDateTime } = require('graphql-iso-date');

const Events = require('../models/event');
const Tickets = require('../models/ticket');
const Statistic = require('../models/statistic');

const TicketType = new GraphQLObjectType({
  name: 'Ticket',
  fields: () => ({
    id: { type: GraphQLID },
    number: { type: new GraphQLNonNull(GraphQLString) },
    encash: { type: new GraphQLNonNull(GraphQLBoolean) },
    event: {
      type: EventType,
      resolve({ eventId }, args) {
        return Events.findById(eventId);
      },
    },
  }),
});

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    date: { type: new GraphQLNonNull(GraphQLDateTime) },
    image: { type: GraphQLString },
    status: { type: new GraphQLNonNull(GraphQLString) },
    rate: { type: GraphQLInt },
    encashTickets: { type: new GraphQLNonNull(GraphQLInt) },
    visited: { type: new GraphQLNonNull(GraphQLInt) },
    tickets: {
      type: new GraphQLList(TicketType),
      resolve({ id }, args) {
        return Tickets.find({ eventId: id });
      },
    },
  }),
});

const PaginationArgType = new GraphQLInputObjectType({
  name: 'PaginationArg',
  fields: {
    offset: {
      type: GraphQLInt,
      description: 'Skip n rows.',
    },
    limit: {
      type: GraphQLInt,
      description: 'First n rows after the offset.',
    },
  },
});

const PaginatedListType = ItemType =>
  new GraphQLObjectType({
    name: 'Paginated' + ItemType,
    fields: {
      count: { type: GraphQLInt },
      items: { type: new GraphQLList(ItemType) },
    },
  });

const StatisticType = new GraphQLObjectType({
  name: 'Statistic',
  fields: () => ({
    id: { type: GraphQLID },
    planned: { type: new GraphQLNonNull(GraphQLInt) },
    completed: { type: new GraphQLNonNull(GraphQLInt) },
    canceled: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    event: {
      type: EventType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Events.findById(id);
      },
    },

    events: {
      type: PaginatedListType(EventType),
      args: {
        pagination: {
          type: PaginationArgType,
          defaultValue: { offset: 0, limit: 10 },
        },
        title: { type: GraphQLString },
      },
      resolve(_, { pagination, title }) {
        const { offset, limit } = pagination;
        return {
          items: Events.find({ title: { $regex: title, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .exec(),
          count: Events.countDocuments(),
        };
      },
    },

    ticket: {
      type: TicketType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Tickets.findById(id);
      },
    },

    tickets: {
      type: new GraphQLList(TicketType),
      resolve(parent, { number }) {
        return Tickets.find({ number: { $regex: number, $options: 'i' } });
      },
    },

    statistic: {
      type: StatisticType,
      args: { id: { type: GraphQLID } },
      resolve(_, { id }) {
        return Statistic.findById(id);
      },
    },

    statistics: {
      type: new GraphQLList(StatisticType),
      resolve(parent, args) {
        return Statistic.find({});
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addEvent: {
      type: EventType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        date: { type: new GraphQLNonNull(GraphQLDateTime) },
        image: { type: GraphQLString },
        status: { type: new GraphQLNonNull(GraphQLString) },
        rate: { type: GraphQLInt },
        encashTickets: { type: new GraphQLNonNull(GraphQLInt) },
        visited: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(
        parent,
        {
          title,
          description,
          date,
          image,
          status,
          rate,
          encashTickets,
          visited,
        },
      ) {
        const event = new Events({
          title,
          description,
          date,
          image,
          status,
          rate,
          encashTickets,
          visited,
        });
        return event.save();
      },
    },

    addTicket: {
      type: TicketType,
      args: {
        number: { type: new GraphQLNonNull(GraphQLString) },
        encash: { type: new GraphQLNonNull(GraphQLBoolean) },
        eventId: { type: GraphQLString },
      },
      resolve(parent, { number, encash, eventId }) {
        const ticket = new Tickets({
          number,
          encash,
          eventId,
        });
        return ticket.save();
      },
    },

    deleteEvent: {
      type: EventType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Events.findByIdAndRemove(id);
      },
    },

    deleteTicket: {
      type: TicketType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Tickets.findByIdAndRemove(id);
      },
    },

    updateEvent: {
      type: EventType,
      args: {
        id: { type: GraphQLID },
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        date: { type: new GraphQLNonNull(GraphQLDateTime) },
        image: { type: GraphQLString },
        status: { type: new GraphQLNonNull(GraphQLString) },
        rate: { type: GraphQLInt },
        encashTickets: { type: new GraphQLNonNull(GraphQLInt) },
        visited: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(
        parent,
        {
          id,
          title,
          description,
          date,
          image,
          status,
          rate,
          encashTickets,
          visited,
        },
      ) {
        return Events.findByIdAndUpdate(
          id,
          {
            $set: {
              title,
              description,
              date,
              image,
              status,
              rate,
              encashTickets,
              visited,
            },
          },
          { new: true },
        );
      },
    },

    updateTicket: {
      type: TicketType,
      args: {
        id: { type: GraphQLID },
        number: { type: new GraphQLNonNull(GraphQLString) },
        encash: { type: new GraphQLNonNull(GraphQLBoolean) },
        eventId: { type: GraphQLString },
      },
      resolve(parent, { id, number, encash, eventId }) {
        return Tickets.findByIdAndUpdate(
          id,
          {
            $set: {
              number,
              encash,
              eventId,
            },
          },
          { new: true },
        );
      },
    },

    updateStatistic: {
      type: StatisticType,
      args: {
        id: { type: GraphQLID },
        planned: { type: new GraphQLNonNull(GraphQLInt) },
        completed: { type: new GraphQLNonNull(GraphQLInt) },
        canceled: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(_, { id, planned, completed, canceled }) {
        return Statistic.findByIdAndUpdate(
          id,
          {
            $set: {
              planned,
              completed,
              canceled,
            },
          },
          { new: true },
        );
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
