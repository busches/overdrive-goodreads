import {expect, test} from 'vitest';
import {parseGoodreadsData} from './parse-goodreads-data.js';

test('prefers the book with the highest number of ratings', async () => {
	const searchString = 'The Will of the Many James Islington';
	const xmlResponse = `
    <?xml version="1.0" encoding="UTF-8"?>
    <GoodreadsResponse>
      <search>
        <query><![CDATA[The Will of the Many James Islington]]></query>
        <results-start>1</results-start>
        <results-end>4</results-end>
        <total-results>4</total-results>
        <results>
          <work>
            <ratings_count type="integer">0</ratings_count>
            <average_rating type="float">0.0</average_rating>
            <best_book type="Book">
              <id type="integer">214878678</id>
              <title>Study Guide: The Will of the Many by James Islington (SuperSummary)</title>
            </best_book>
          </work>
          <work>
            <ratings_count type="integer">244675</ratings_count>
            <average_rating>4.58</average_rating>
            <best_book type="Book">
              <id type="integer">246481295</id>
              <title>The Will of the Many (Hierarchy, #1)</title>
            </best_book>
          </work>
          <work>
            <ratings_count type="integer">0</ratings_count>
            <average_rating type="float">0.0</average_rating>
            <best_book type="Book">
              <id type="integer">245012316</id>
              <title>The Will of the Many - James Islington</title>
            </best_book>
          </work>
          <work>
            <ratings_count type="integer">11</ratings_count>
            <average_rating>4.73</average_rating>
            <best_book type="Book">
              <id type="integer">248004071</id>
              <title>Hierarchy Series by James Islington 2 Books Collection Set (The Strength of the Few [Hardback], The Will of the Many)</title>
            </best_book>
          </work>
        </results>
      </search>
    </GoodreadsResponse>
    `;

	const result = await parseGoodreadsData(xmlResponse, searchString);
	expect(result).toMatchObject({
		bookId: 246_481_295,
		rating: 4.58,
		searchString: 'The Will of the Many James Islington',
	});
});
